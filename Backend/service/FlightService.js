const sequelize = require("sequelize");
const FlightComment = require("../config/postgres")["FlightComment"];
const Flight = require("../config/postgres")["Flight"];
const User = require("../config/postgres")["User"];
const Team = require("../config/postgres")["Team"];
const Club = require("../config/postgres")["Club"];
const FlightPhoto = require("../config/postgres")["FlightPhoto"];
const FlyingSite = require("../config/postgres")["FlyingSite"];
const FlightFixes = require("../config/postgres")["FlightFixes"];

const moment = require("moment");
const _ = require("lodash");

const IgcAnalyzer = require("../igc/IgcAnalyzer");
const { findLanding } = require("../igc/LocationFinder");
const ElevationAttacher = require("../igc/ElevationAttacher");
const FlightStatsCalculator = require("../igc/FlightStatsCalculator");
const { getCurrentActive } = require("./SeasonService");
const { findClosestTakeoff } = require("./FlyingSiteService");
const { hasAirspaceViolation } = require("./AirspaceService");

const cacheManager = require("./CacheManager");

const { isNoWorkday } = require("../helper/HolidayCalculator");
const { getCurrentYear } = require("../helper/Utils");

const { COUNTRY } = require("../constants/user-constants");
const { STATE } = require("../constants/flight-constants");

const flightService = {
  getAll: async (
    year,
    site,
    type,
    rankingClass,
    limit,
    offset,
    sortByPoints,
    startDate,
    endDate,
    userId,
    clubId,
    teamId,
    gliderClass,
    status
  ) => {
    let fillCache = false;
    if (
      isCacheSufficent(year, [
        site,
        type,
        rankingClass,
        limit,
        offset,
        sortByPoints,
        startDate,
        endDate,
        userId,
        clubId,
        teamId,
        gliderClass,
        status,
      ])
    ) {
      const currentYearCache = cacheManager.getCurrentYearFlightCache();
      if (currentYearCache) return currentYearCache;
      else fillCache = true;
    }

    const orderStatement = sortByPoints
      ? ["flightPoints", "DESC"]
      : ["takeoffTime", "DESC"];

    const queryObject = {
      include: [
        createUserInclude(),
        createSiteInclude(site),
        createTeamInclude(teamId),
        createClubInclude(clubId),
      ],
      where: await createWhereStatement(
        year,
        type,
        rankingClass,
        startDate,
        endDate,
        userId,
        gliderClass,
        status
      ),
      order: [orderStatement],
    };

    if (limit) {
      queryObject.limit = limit;
    }

    if (offset) {
      queryObject.offset = offset;
    }

    const flights = await Flight.findAll(queryObject);

    if (fillCache) cacheManager.setCurrentYearFlightCache(flights);

    return flights;
  },

  getTodays: async () => {
    const SWITCHOVER_HOUR_TODAY_RANKING = 12;

    const today = new Date();
    let fromDay = today.getDate() - 1;
    let tillDay = today.getDate();

    if (
      today.getHours() + today.getTimezoneOffset() / 2 >=
      SWITCHOVER_HOUR_TODAY_RANKING
    ) {
      fromDay++;
      tillDay++;
    }
    const fromDate = new Date(today.getFullYear(), today.getMonth(), fromDay);
    const tillDate = new Date(today.getFullYear(), today.getMonth(), tillDay);

    const queryObject = {
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: FlightFixes,
          as: "fixes",
          attributes: ["geom"],
        },
        {
          model: FlyingSite,
          as: "takeoff",
          attributes: ["name"],
        },
      ],
      where: await createWhereStatement(null, null, null, fromDate, tillDate),
      order: [["flightPoints", "DESC"]],
    };

    const flightDbObjects = await Flight.findAll(queryObject);

    const flights = filterFlightFixesForTodayRanking(flightDbObjects);

    return flights;
  },

  getById: async (id, noIncludes) => {
    const includes = [
      {
        model: FlyingSite,
        as: "takeoff",
        attributes: ["id", "name"],
      },
      {
        model: FlightFixes,
        as: "fixes",
        attributes: ["geom", "timeAndHeights"],
      },
    ];
    return await Flight.findOne({
      where: { id },
      include: noIncludes ? [] : includes,
    });
  },

  getByExternalId: async (externalId) => {
    const flightDbObject = await Flight.findOne({
      where: { externalId },
      include: [
        {
          model: FlightFixes,
          as: "fixes",
          attributes: ["geom", "timeAndHeights", "stats"],
        },
        {
          model: FlightComment,
          as: "comments",
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: FlyingSite,
          as: "takeoff",
          attributes: ["id", "name", "direction"],
        },
        {
          model: Club,
          attributes: ["name"],
        },
        {
          model: Team,
          attributes: ["name"],
        },
        {
          model: FlightPhoto,
        },
      ],
      order: [
        [{ model: FlightComment, as: "comments" }, "createdAt", "ASC"],
        [FlightPhoto, "createdAt", "ASC"],
      ],
    });
    if (flightDbObject) {
      const flight = flightDbObject.toJSON();
      //TODO Merge directly when model is retrieved?

      flight.fixes = FlightFixes.mergeData(flight.fixes);
      flight.airbuddies = await findAirbuddies(flight);

      //Unescape characters which where sanitzied before stored to db
      flight.report = _.unescape(flight.report);
      flight.comments.forEach((comment) => {
        comment.message = _.unescape(comment.message);
      });
      flight.FlightPhotos.forEach((photo) => {
        photo.description = _.unescape(photo.description);
      });

      return flight;
    }
    return null;
  },

  sumDistance: async (year) => {
    const totalDistance = await Flight.sum("flightDistance", {
      where: {
        andOp: sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
          year
        ),
      },
    });
    return Math.round(totalDistance);
  },

  getAllBrands: async () => {
    const query = `SELECT DISTINCT ON (glider->'brand') glider->'brand' AS "brand"
    FROM "Flights";`;

    const brands = await Flight.sequelize.query(query, {
      type: Flight.sequelize.QueryTypes.SELECT,
    });

    // Refactor array of objects to plain array of strings
    return brands.map((e) => e.brand);
  },

  update: async (flight) => {
    return flight.save();
  },

  finalizeFlightSubmission: async (flight, report, status, glider) => {
    const columnsToUpdate = {};
    if (status) {
      columnsToUpdate.flightStatus = status;
    }
    if (report) {
      columnsToUpdate.report = report;
    }
    if (glider) {
      await createGliderObject(columnsToUpdate, glider);
      const newGliderClass = columnsToUpdate.glider.gliderClass.key;
      if (newGliderClass != flight?.glider?.gliderClass?.key) {
        const result = await calcFlightPointsAndStatus(flight, glider, status);
        columnsToUpdate.flightPoints = result.flightPoints;
        columnsToUpdate.flightStatus = result.flightStatus;
      }
    }
    cacheManager.invalidateCaches();

    return Flight.update(columnsToUpdate, {
      where: {
        id: flight.id,
      },
      returning: true,
    });
  },

  delete: async (id) => {
    return Flight.destroy({
      where: { id },
    });
  },

  addResult: async (result) => {
    console.log("ADD RESULT TO FLIGHT");
    const flight = await flightService.getById(result.id);
    console.log(flight.fixes[0]);
    flight.flightDistance = result.dist;
    flight.flightType = result.type;
    flight.flightTurnpoints = result.turnpoints;
    calculateTaskSpeed(result, flight);

    if (flight.glider) {
      // If true, the calculation took so long that the glider was already submitted by the user.
      // Therefore calculation of points and status can and will be started here.
      const result = await calcFlightPointsAndStatus(
        flight,
        flight.glider,
        flight.status
      );
      flight.flightPoints = result.flightPoints;
      flight.flightStatus = result.flightStatus;
    }

    ElevationAttacher.execute(
      FlightFixes.mergeData(flight.toJSON().fixes),
      async (fixesWithElevation) => {
        //TODO Nach Umstellung von DB Model (fixes -> geom & timeAndHeights) ist das hier nur noch Chaos! Vereinfachen!!!
        let flightFixes = await retrieveDbObjectOfFlightFixes(flight.id);
        for (let i = 0; i < flightFixes.timeAndHeights.length; i++) {
          flightFixes.timeAndHeights[i].elevation =
            fixesWithElevation[i].elevation;
        }
        /**
         * It is necessary to explicit call "changed", because a call to "save" will only updated data when a value has changed.
         * Unforunatly the addition of elevation data inside the data object doesn't trigger any change event.
         */
        flightFixes.changed("timeAndHeights", true);
        await flightFixes.save();

        /**
         * Before evaluating airspace violation it's necessary to determine the elevation data.
         * Because some airspace bounderies are defined in relation to the surface (e.g. Floor 1500FT AGL)
         */
        if (await hasAirspaceViolation(flightFixes)) {
          flight.airspaceViolation = true;
          flight.save();
        }
      }
    );

    flight.save();
  },

  create: async (flight) => {
    //TODO ExternalID als Hook im Model realisieren?
    await Promise.all([addUserData(flight), addExternalId(flight)]);
    return Flight.create(flight);
  },

  startResultCalculation: async (flight) => {
    const flightTypeFactors = (await getCurrentActive()).flightTypeFactors;
    IgcAnalyzer.startCalculation(flight, flightTypeFactors, (result) => {
      flightService.addResult(result);
    });
  },

  extractFixesAndAddFurtherInformationToFlight: async (flight) => {
    const fixes = IgcAnalyzer.extractFixes(flight);

    flight.airtime = calcAirtime(fixes);
    flight.takeoffTime = new Date(fixes[0].timestamp);
    flight.landingTime = new Date(fixes[fixes.length - 1].timestamp);
    flight.isWeekend = isNoWorkday(flight.takeoffTime);

    const requests = [findClosestTakeoff(fixes[0])];
    if (process.env.USE_GOOGLE_API === "true") {
      requests.push(findLanding(fixes[fixes.length - 1]));
    }
    const results = await Promise.all(requests);
    const flyingSite = results[0];
    flight.siteId = flyingSite.id;
    flight.landing = results.length > 1 ? results[1] : undefined;

    const {
      minHeightBaro,
      maxHeightBaro,
      minHeightGps,
      maxHeightGps,
      maxSink,
      maxClimb,
      maxSpeed,
      fixesStats,
    } = FlightStatsCalculator.execute(fixes);
    flight.flightStats = {
      minHeightBaro,
      maxHeightBaro,
      minHeightGps,
      maxHeightGps,
      maxSink,
      maxClimb,
      maxSpeed,
    };

    FlightFixes.create({
      flightId: flight.id,
      geom: FlightFixes.createGeometry(fixes),
      timeAndHeights: FlightFixes.extractTimeAndHeights(fixes),
      stats: fixesStats,
    });

    return flyingSite.name;
  },
};

function calculateTaskSpeed(result, flight) {
  flight.flightStats.taskSpeed =
    Math.round((result.dist / flight.airtime) * 600) / 10;
  flight.changed("flightStats", true);
}

function calcAirtime(fixes) {
  return Math.round(
    (fixes[fixes.length - 1].timestamp - fixes[0].timestamp) / 1000 / 60
  );
}

async function calcFlightPointsAndStatus(flight, glider, status) {
  const currentSeason = await getCurrentActive();
  const gliderClass = currentSeason.gliderClasses[glider.gliderClass];
  console.log(
    `Glider class changed to ${gliderClass.shortDescription}. Will recalculate flightPoints`
  );
  const flightPoints = calcFlightPoints(flight, currentSeason, gliderClass);

  const flightStatus = determineFlightStatus(
    currentSeason,
    flightPoints,
    status
  );

  console.log(`Flight calculated with ${flightPoints} points`);
  console.log(`Flight status set to ${flightStatus}`);

  return { flightPoints, flightStatus };
}

function determineFlightStatus(currentSeason, flightPoints, submittedStatus) {
  if (!flightPoints) return STATE.IN_PROCESS;

  if (submittedStatus == STATE.FLIGHTBOOK || currentSeason.isPaused == true)
    return STATE.FLIGHTBOOK;

  const pointThreshold = currentSeason.pointThresholdForFlight;
  return flightPoints >= pointThreshold
    ? STATE.IN_RANKING
    : STATE.NOT_IN_RANKING;
}

async function createGliderObject(columnsToUpdate, glider) {
  const currentSeason = await getCurrentActive();
  const gliderClass = currentSeason.gliderClasses[glider.gliderClass];
  columnsToUpdate.glider = {};
  columnsToUpdate.glider.brand = glider.brand;
  columnsToUpdate.glider.model = glider.model;
  columnsToUpdate.glider.gliderClass = {};
  columnsToUpdate.glider.gliderClass.key = glider.gliderClass;
  columnsToUpdate.glider.gliderClass.description = gliderClass.description;
  columnsToUpdate.glider.gliderClass.shortDescription =
    gliderClass.shortDescription;
}

function calcFlightPoints(flight, seasonDetail, gliderClass) {
  if (flight.flightType && flight.flightDistance) {
    const typeFactor = seasonDetail.flightTypeFactors[flight.flightType];
    const gliderFactor = gliderClass.value;
    const distance = flight.flightDistance;
    return Math.round(typeFactor * gliderFactor * distance);
  }
  console.log(
    "Flight calculation must be still in process. Will set flightPoints to 0."
  );
  return 0;
}

async function retrieveDbObjectOfFlightFixes(flightId) {
  return FlightFixes.findOne({
    where: {
      flightId,
    },
  });
}

function filterFlightFixesForTodayRanking(flightDbObjects) {
  const FIXES_PER_HOUR = 60;
  const flights = flightDbObjects.map((entry) => entry.toJSON());
  flights.forEach((entry) => {
    const fixes = entry.fixes.geom.coordinates;
    entry.fixes = [];

    //Fixes are stored in db with an interval of 5s
    const step = 3600 / 5 / FIXES_PER_HOUR;

    for (let index = 0; index < fixes.length; index += step) {
      entry.fixes.push({ lat: fixes[index][1], long: fixes[index][0] });
    }
    if (fixes.length % step !== 0) {
      //Add always the last fix
      entry.fixes.push({
        lat: fixes[fixes.length - 1][1],
        long: fixes[fixes.length - 1][0],
      });
    }
  });
  return flights;
}

/**
 * This function will find flights with are related to a provided flight.
 * A flight is related if,
 * * it was lunched from the same takeoff,
 * * within a timeframe of +- 2h to the provided flight
 * * and exceeds a minimum flightPoints of 30 points (~5km FAI with AB_low)
 *
 * From the testdata the following to flights are related:
 * * 4d7cc8fe-f4ab-49fa-aea3-9b996ff5fa14
 * * 07b590f3-ca8a-4305-88a2-e11c314b4955
 *
 * @param {*} flight The flight to which airBuddies should be found.
 */
async function findAirbuddies(flight) {
  //TODO Is it possible to join airBuddiesfor to the provided flight directly with the first query to the db?
  //Problem how can i back reference in an include statement (takeoffTime, siteId)

  const timeOffsetValue = 2;
  const timeOffsetUnit = "h";
  const pointThreshold = 30;

  const from = moment(flight.takeoffTime).subtract(
    timeOffsetValue,
    timeOffsetUnit
  );
  const till = moment(flight.takeoffTime).add(timeOffsetValue, timeOffsetUnit);
  return Flight.findAll({
    where: {
      id: {
        [sequelize.Op.not]: flight.id,
      },
      siteId: flight.siteId,
      takeoffTime: {
        [sequelize.Op.between]: [from, till],
      },
      flightPoints: {
        [sequelize.Op.gte]: pointThreshold,
      },
    },
    include: {
      model: User,
      attributes: ["firstName", "lastName"],
    },
  });
}

/**
 * This method will generate a new externalId for a flight by finding the current heightest externalId and increment it by one.
 *
 * Postgres does not support auto increment on non PK columns.
 * Therefore a manual auto increment is necessary.
 *
 * @param {*} flight The flight the externalId will be attached to.
 */
async function addExternalId(flight) {
  flight.externalId = (await Flight.max("externalId")) + 1;
  console.log("New external ID was created: " + flight.externalId);
}

/**
 * This method will add specific user data (current clubId, teamId and age of the user) to the flight.
 *
 * It's necessary to add team and club id of user directly to the flight.
 * Because user can change its assocation in the future.
 *
 * @param {*} flight The flight the user data will be attached to.
 */
async function addUserData(flight) {
  const user = await User.findByPk(flight.userId);
  flight.teamId = user.teamId;
  flight.clubId = user.clubId;
  flight.homeStateOfUser =
    user.address.country == COUNTRY.GER
      ? user.address.state
      : user.address.country;
  flight.ageOfUser = user.getAge();
}

async function createWhereStatement(
  year,
  flightType,
  rankingClass,
  startDate,
  endDate,
  userId,
  gliderClass,
  flightStatus
) {
  let whereStatement;
  if (
    flightType ||
    year ||
    rankingClass ||
    startDate ||
    endDate ||
    userId ||
    gliderClass ||
    flightStatus
  ) {
    whereStatement = {};
  }
  if (flightType) {
    whereStatement.flightType = flightType;
  }
  if (flightStatus) {
    whereStatement.flightStatus = flightStatus;
  }
  if (userId) {
    whereStatement.userId = userId;
  }
  if (year) {
    whereStatement.andOp = sequelize.where(
      sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
      year
    );
  }
  if (startDate && endDate) {
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: [startDate, endDate],
    };
  }
  if (rankingClass) {
    const gliderClasses =
      (await getCurrentActive()).rankingClasses[rankingClass].gliderClasses ??
      [];

    whereStatement.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };
  }
  if (gliderClass) {
    whereStatement.glider = {
      gliderClass: { key: gliderClass },
    };
  }
  return whereStatement;
}

function createSiteInclude(shortName) {
  const include = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["id", "shortName", "name", "direction"],
  };
  if (shortName) {
    include.where = {
      shortName,
    };
  }
  return include;
}

function createUserInclude() {
  const include = {
    model: User,
    attributes: ["firstName", "lastName"],
  };
  return include;
}

function createClubInclude(id) {
  const include = {
    model: Club,
    attributes: ["name"],
  };
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

function createTeamInclude(id) {
  const include = {
    model: Team,
    attributes: ["name"],
  };
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

/**
 * The most often request is to display the flights of the current year. Therefore a cache for this request is introduced.
 * It is possible to use the cache, if only flights of the current year with no filter parameters are requested.
 *
 * @returns
 */
function isCacheSufficent(year, values) {
  return year == getCurrentYear() && values.every((e) => e == undefined);
}

module.exports = flightService;
