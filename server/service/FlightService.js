const sequelize = require("sequelize");
const FlightComment = require("../config/postgres")["FlightComment"];
const Flight = require("../config/postgres")["Flight"];
const User = require("../config/postgres")["User"];
const Team = require("../config/postgres")["Team"];
const Club = require("../config/postgres")["Club"];
const Brand = require("../config/postgres")["Brand"];
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
const { getCurrentYear, sleep } = require("../helper/Utils");

const { COUNTRY } = require("../constants/user-constants");
const { STATE } = require("../constants/flight-constants");

const logger = require("../config/logger");

const flightService = {
  getAll: async ({
    year,
    site,
    siteId,
    type,
    rankingClass,
    limit,
    offset,
    startDate,
    endDate,
    userId,
    clubId,
    teamId,
    gliderClass,
    status,
    unchecked,
    sort,
  } = {}) => {
    let fillCache = false;
    if (
      isCacheSufficent(year, [
        site,
        siteId,
        type,
        rankingClass,
        limit,
        offset,
        startDate,
        endDate,
        userId,
        clubId,
        teamId,
        gliderClass,
        status,
        unchecked,
        sort,
      ])
    ) {
      const currentYearCache = cacheManager.getCurrentYearFlightCache();
      if (currentYearCache) return currentYearCache;
      else {
        fillCache = true;
      }
    }

    const orderStatement = createOrderStatement(sort);

    const queryObject = {
      include: [
        createUserInclude(),
        createSiteInclude(site, siteId),
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
        status,
        unchecked
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
        createUserInclude(),
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

    const flights = stripFlightFixesForTodayRanking(flightDbObjects);

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
          include: [createUserInclude()],
        },
        createUserInclude(),
        {
          model: FlyingSite,
          as: "takeoff",
          attributes: ["id", "name", "direction"],
        },
        createClubInclude(),
        createTeamInclude(),
        {
          model: FlightPhoto,
          as: "photos",
        },
      ],
      order: [
        [{ model: FlightComment, as: "comments" }, "createdAt", "ASC"],
        [{ model: FlightPhoto, as: "photos" }, "createdAt", "ASC"],
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
      flight.photos.forEach((photo) => {
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
    // const query = `SELECT DISTINCT ON (glider->'brand') glider->'brand' AS "brand"
    // FROM "Flights";`;

    // const brands = await Flight.sequelize.query(query, {
    //   type: Flight.sequelize.QueryTypes.SELECT,
    // });

    // // Refactor array of objects to plain array of strings
    const brands = await Brand.findAll();
    return brands.map((e) => e.name);
  },

  update: async (flight) => {
    return flight.save();
  },

  acceptViolation: async (flight) => {
    flight.violationAccepted = true;
    return flight.save();
  },

  finalizeFlightSubmission: async (
    flight,
    report,
    airspaceReport,
    onlyLogbook,
    glider,
    hikeAndFly
  ) => {
    const columnsToUpdate = {};

    // Set report when value is defined or emptry
    if (report || report == "") {
      columnsToUpdate.report = report;
    }
    if (airspaceReport || airspaceReport == "") {
      columnsToUpdate.airspaceReport = airspaceReport;
    }

    if (hikeAndFly) {
      const site = await FlyingSite.findByPk(flight.siteId, {
        attributes: ["heightDifference"],
      });
      columnsToUpdate.hikeAndFly = site.heightDifference;
    }
    if (hikeAndFly == 0) {
      columnsToUpdate.hikeAndFly = 0;
    }

    if (glider) {
      await createGliderObject(columnsToUpdate, glider);

      const flightPoints = await calcFlightPoints(flight, glider);
      columnsToUpdate.flightPoints = flightPoints;

      const flightStatus = await calcFlightStatus(flightPoints, onlyLogbook);
      columnsToUpdate.flightStatus = flightStatus;
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
    logger.info("Will add igc result to flight " + result.id);
    const flight = await flightService.getById(result.id, true);

    flight.flightDistance = result.dist;
    flight.flightType = result.type;
    flight.flightTurnpoints = result.turnpoints;
    calculateTaskSpeed(result, flight);

    if (flight.glider) {
      // If true, the calculation took so long that the glider was already submitted by the user.
      // Therefore calculation of points and status can and will be started here.
      const flightPoints = await calcFlightPoints(flight, flight.glider);
      flight.flightPoints = flightPoints;

      const flightStatus = await calcFlightStatus(flight);
      flight.flightStatus = flightStatus;
    }

    const fixes = await retrieveDbObjectOfFlightFixes(flight.id);

    ElevationAttacher.execute(
      FlightFixes.mergeData(fixes),
      async (fixesWithElevation) => {
        //TODO Nach Umstellung von DB Model (fixes -> geom & timeAndHeights) ist das hier nur noch Chaos! Vereinfachen!!!
        for (let i = 0; i < fixes.timeAndHeights.length; i++) {
          fixes.timeAndHeights[i].elevation = fixesWithElevation[i].elevation;
        }
        /**
         * It is necessary to explicit call "changed", because a call to "save" will only updated data when a value has changed.
         * Unforunatly the addition of elevation data inside the data object doesn't trigger any change event.
         */
        fixes.changed("timeAndHeights", true);
        await fixes.save();

        /**
         * Before evaluating airspace violation it's necessary to determine the elevation data.
         * Because some airspace bounderies are defined in relation to the surface (e.g. Floor 1500FT AGL)
         */
        if (await hasAirspaceViolation(fixes)) {
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
    }).catch((error) => logger.error(error));
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
    flight.region = flyingSite.region;
    flight.landing = results.length > 1 ? results[1] : "API Disabled";

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

function createOrderStatement(sort) {
  if (!(sort && sort[0])) return ["takeoffTime", "DESC"];

  if (!sort[1]) return [sort[0], "DESC"];

  return sort;
}

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

/**
 * Calculates the points of a flight by the flight distance, flight type and class of glider.
 *
 * @param {*} flight The flight which is the source for distance and type.
 * @param {*} glider The glider which determines the glider class. This glider can be different from the glider currently stored in flight.
 * @returns The points for this flight.
 */
async function calcFlightPoints(flight, glider) {
  const currentSeason = await getCurrentActive();
  const gliderClassKey = glider.gliderClass.key;
  const gliderClassDB = currentSeason.gliderClasses[gliderClassKey];

  logger.info(
    `Glider class is ${gliderClassKey}. Will recalculate flightPoints`
  );

  let flightPoints;
  if (flight.flightType && flight.flightDistance) {
    const typeFactor = currentSeason.flightTypeFactors[flight.flightType];
    const gliderFactor = gliderClassDB.value;
    const distance = flight.flightDistance;
    flightPoints = Math.round(typeFactor * gliderFactor * distance);
  } else {
    logger.debug(
      "Flight calculation must be still in process. Will set flightPoints to 0."
    );
    flightPoints = 0;
  }

  logger.info(`Flight calculated with ${flightPoints} points`);

  return flightPoints;
}

async function calcFlightStatus(flightPoints, onlyLogbook) {
  if (!flightPoints) return STATE.IN_PROCESS;
  const currentSeason = await getCurrentActive();

  if (onlyLogbook || currentSeason.isPaused == true) return STATE.FLIGHTBOOK;

  const pointThreshold = currentSeason.pointThresholdForFlight;

  const flightStatus =
    flightPoints >= pointThreshold ? STATE.IN_RANKING : STATE.NOT_IN_RANKING;

  logger.debug(`Flight status set to ${flightStatus}`);

  return flightStatus;
}

async function createGliderObject(columnsToUpdate, glider) {
  const currentSeason = await getCurrentActive();
  const gliderClassDB = currentSeason.gliderClasses[glider.gliderClass.key];

  columnsToUpdate.glider = {
    ...glider,
    gliderClass: {
      key: glider.gliderClass.key,
      description: gliderClassDB.description,
      shortDescription: gliderClassDB.shortDescription,
    },
  };
}

async function retrieveDbObjectOfFlightFixes(flightId) {
  const MAX_ATTEMPTS = 1;

  logger.debug("Will retrieve fixes for flight: ", flightId);
  for (let index = 0; index < MAX_ATTEMPTS; index++) {
    const fixes = await FlightFixes.findOne({
      where: {
        flightId,
      },
    });

    if (fixes.geom?.coordinates.length > 0) return fixes;

    logger.warn("Fixes geom was empty. Will try again.");
    sleep(1000);
  }
}

function stripFlightFixesForTodayRanking(flightDbObjects) {
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
      as: "user",
      attributes: ["id", "firstName", "lastName"],
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
  logger.debug("New external ID was created: " + flight.externalId);
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
    user.address.country == COUNTRY.DEU
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
  flightStatus,
  unchecked
) {
  let whereStatement;
  if (unchecked) {
    whereStatement = {
      [sequelize.Op.or]: [
        { airspaceViolation: true },
        { uncheckedGRecord: true },
      ],
      violationAccepted: false,
    };
  } else {
    whereStatement = {};
  }
  if (flightType) {
    whereStatement.flightType = flightType;
  }
  if (flightStatus) {
    whereStatement.flightStatus = flightStatus;
  } else {
    whereStatement.flightStatus = {
      [sequelize.Op.not]: STATE.IN_PROCESS,
    };
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
  if (startDate) {
    const definedEndDate = endDate ? endDate : new Date();
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: [startDate, definedEndDate],
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

function createSiteInclude(shortName, id) {
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
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

function createUserInclude() {
  const include = {
    model: User,
    as: "user",
    attributes: ["id", "firstName", "lastName"],
  };
  return include;
}

function createClubInclude(id) {
  const include = {
    model: Club,
    as: "club",
    attributes: ["id", "name"],
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
    as: "team",
    attributes: ["id", "name"],
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
  const paras = values.every((e) => {
    if (e != undefined) {
      logger.debug(`In cache check one parameter of value ${e} was defined`);
    }
    return e == undefined;
  });
  return year == getCurrentYear() && paras;
}

module.exports = flightService;
