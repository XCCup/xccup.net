const sequelize = require("sequelize");
const FlightComment = require("../config/postgres")["FlightComment"];
const Flight = require("../config/postgres")["Flight"];
const User = require("../config/postgres")["User"];
const Team = require("../config/postgres")["Team"];
const Club = require("../config/postgres")["Club"];
const UserMedia = require("../config/postgres")["UserMedia"];
const FlyingSite = require("../config/postgres")["FlyingSite"];
const FlightFixes = require("../config/postgres")["FlightFixes"];

const moment = require("moment");

const IgcAnalyzer = require("../igc/IgcAnalyzer");
const { findLanding } = require("../igc/LocationFinder");
const ElevationAttacher = require("../igc/ElevationAttacher");
const { getCurrentActive } = require("./SeasonService");
const { findClosestTakeoff } = require("./FlyingSiteService");
const { hasAirspaceViolation } = require("./AirspaceService");

const cacheManager = require("./CacheManager");

const { isNoWorkday } = require("../helper/HolidayCalculator");

const flightService = {
  STATE_IN_RANKING: "In Wertung",
  STATE_NOT_IN_RANKING: "Nicht in Wertung",
  STATE_FLIGHTBOOK: "Flugbuch",
  STATE_IN_PROCESS: "In Bearbeitung",

  FLIGHT_TYPES: ["FREE", "FLAT", "FAI"],

  getAll: async (
    year,
    site,
    type,
    rankingClass,
    limit,
    sortByPoints,
    startDate,
    endDate
  ) => {
    let fillCache = false;
    if (
      isCacheSufficent(year, [
        site,
        type,
        rankingClass,
        limit,
        sortByPoints,
        startDate,
        endDate,
      ])
    ) {
      const currentYearCache = cacheManager.getCurrentYearFlightCache();
      if (currentYearCache) return currentYearCache;
      else fillCache = true;
    }

    const orderStatement = sortByPoints
      ? ["flightPoints", "DESC"]
      : ["dateOfFlight", "DESC"];

    const queryObject = {
      include: [
        {
          model: User,
          attributes: ["name"],
        },
        createSiteInclude(site),
      ],
      where: await createWhereStatement(
        year,
        type,
        rankingClass,
        startDate,
        endDate
      ),
      order: [orderStatement],
    };

    if (limit) {
      queryObject.limit = limit;
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
    if (today.getHours() > SWITCHOVER_HOUR_TODAY_RANKING) {
      fromDay++;
      tillDay++;
    }
    const fromDate = new Date(today.getFullYear(), today.getMonth(), fromDay);
    const tillDate = new Date(today.getFullYear(), today.getMonth(), tillDay);

    const queryObject = {
      include: [
        {
          model: User,
          attributes: ["name"],
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

  getById: async (flightId) => {
    return await Flight.findOne({
      where: { id: flightId },
      include: [
        {
          model: FlightFixes,
          as: "fixes",
          attributes: ["geom", "timeAndHeights"],
        },
        {
          model: FlyingSite,
          as: "takeoff",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  getByIdForDisplay: async (flightId) => {
    const flightDbObject = await Flight.findOne({
      where: { id: flightId },
      include: [
        {
          model: FlightFixes,
          as: "fixes",
          attributes: ["geom", "timeAndHeights"],
        },
        {
          model: FlightComment,
          as: "comments",
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
        {
          model: User,
          attributes: ["name"],
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
          model: UserMedia,
        },
      ],
    });
    if (flightDbObject) {
      let flight = flightDbObject.toJSON();

      //TODO Merge directly when model is retrieved?
      flight.fixes = FlightFixes.mergeCoordinatesAndOtherData(flight.fixes);
      flight.flightBuddies = await findFlightBuddies(flight);
      return flight;
    }
    return null;
  },

  sumDistance: async (year) => {
    const totalDistance = await Flight.sum("flightDistance", {
      where: {
        andOp: sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("dateOfFlight")),
          year
        ),
      },
    });
    return Math.round(totalDistance);
  },

  update: async (flight) => {
    cacheManager.invalidateCaches();
    return flight.save();
  },

  editReportGliderAndStartCalculationOfFlightPoints: async (
    flight,
    report,
    glider
  ) => {
    const columnsToUpdate = {};
    if (report) {
      columnsToUpdate.report = report;
    }
    if (glider) {
      const currentSeason = await getCurrentActive();
      const gliderClass = currentSeason.gliderClasses[glider.gliderClass];
      createGliderObject(columnsToUpdate, glider, gliderClass);
      const newGliderClass = columnsToUpdate.glider.gliderClass.key;
      if (newGliderClass != flight?.glider?.gliderClass?.key) {
        //TODO Be aware! Flight calculation could still be in process!
        console.log(
          `Glider class changed to ${newGliderClass}. Will recalculate flightPoints`
        );
        const flightPoints = calcFlightPoints(
          flight,
          currentSeason,
          gliderClass
        );

        const flightStatus = calcFlightStatus(currentSeason, flightPoints);

        console.log(`Flight calculated with ${flightPoints} points`);
        console.log(`Flight status set to ${flightStatus}`);
        columnsToUpdate.flightPoints = flightPoints;
        columnsToUpdate.flightStatus = flightStatus;
      }
      cacheManager.invalidateCaches();
    }

    return Flight.update(columnsToUpdate, {
      where: {
        id: flight.id,
      },
      returning: true,
    });
  },

  delete: async (id) => {
    cacheManager.invalidateCaches();
    return Flight.destroy({
      where: { id },
    });
  },

  addResult: async (result) => {
    cacheManager.invalidateCaches();
    console.log("ADD RESULT TO FLIGHT");
    const flight = await flightService.getById(result.id);

    flight.flightDistance = result.dist;
    flight.flightType = result.type;

    flight.flightTurnpoints = result.turnpoints;

    ElevationAttacher.execute(
      FlightFixes.mergeCoordinatesAndOtherData(flight.toJSON().fixes),
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
    await addUserData(flight);
    await addExternalId(flight);
    return Flight.create(flight);
  },

  startResultCalculation: async (flight) => {
    const flightTypeFactors = (await getCurrentActive()).flightTypeFactors;
    IgcAnalyzer.startCalculation(flight, flightTypeFactors, (result) => {
      flightService.addResult(result);
    });
  },

  extractFixesAddLocationsAndDateOfFlight: async (flight) => {
    const fixes = IgcAnalyzer.extractFixes(flight);
    flight.dateOfFlight = new Date(fixes[0].timestamp);
    flight.isWeekend = isNoWorkday(flight.dateOfFlight);

    const flyingSite = await findClosestTakeoff(fixes[0]);
    flight.siteId = flyingSite.id;

    if (process.env.USE_GOOGLE_API === "true") {
      flight.landing = await findLanding(fixes[fixes.length - 1]);
    }

    FlightFixes.create({
      flightId: flight.id,
      geom: FlightFixes.createGeometry(fixes),
      timeAndHeights: FlightFixes.extractTimeAndHeights(fixes),
    });

    return flyingSite.name;
  },
};

function calcFlightStatus(currentSeason, flightPoints) {
  const pointThreshold = currentSeason.pointThresholdForFlight;
  if (flightPoints >= pointThreshold) {
    return flightService.STATE_IN_RANKING;
  } else {
    return flightService.STATE_NOT_IN_RANKING;
  }
}

function createGliderObject(columnsToUpdate, glider, gliderClass) {
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
  const typeFactor = seasonDetail.flightTypeFactors[flight.flightType];
  const gliderFactor = gliderClass.value;
  const distance = flight.flightDistance;
  return Math.round(typeFactor * gliderFactor * distance);
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
 * @param {*} flight The flight to which flightBuddies should be found.
 */
async function findFlightBuddies(flight) {
  //TODO Is it possible to join flightBuddiesfor to the provided flight directly with the first query to the db?
  //Problem how can i back reference in an include statement (dateOfFlight, siteId)
  const timeOffsetValue = 2;
  const timeOffsetUnit = "h";
  const pointThreshold = 30;

  const from = moment(flight.dateOfFlight).subtract(
    timeOffsetValue,
    timeOffsetUnit
  );
  const till = moment(flight.dateOfFlight).add(timeOffsetValue, timeOffsetUnit);
  return Flight.findAll({
    where: {
      id: {
        [sequelize.Op.not]: flight.id,
      },
      siteId: flight.siteId,
      dateOfFlight: {
        [sequelize.Op.between]: [from, till],
      },
      flightPoints: {
        [sequelize.Op.gte]: pointThreshold,
      },
    },
    include: {
      model: User,
      attributes: ["name"],
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
  flight.homeStateOfUser = user.state;
  flight.ageOfUser = user.getAge();
}

async function createWhereStatement(
  year,
  flightType,
  rankingClass,
  startDate,
  endDate
) {
  let whereStatement;
  if (flightType || year || rankingClass || startDate || endDate) {
    whereStatement = {};
  }
  if (flightType) {
    whereStatement.flightType = flightType;
  }
  if (year) {
    whereStatement.andOp = sequelize.where(
      sequelize.fn("date_part", "year", sequelize.col("dateOfFlight")),
      year
    );
  }
  if (startDate && endDate) {
    whereStatement.dateOfFlight = {
      [sequelize.Op.between]: [startDate, endDate],
    };
  }

  if (rankingClass) {
    const gliderClasses =
      (await getCurrentActive()).rankingClasses[rankingClass].gliderClasses ??
      [];

    console.log("GL_C: ", gliderClasses);
    whereStatement.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };
  }
  return whereStatement;
}

function createSiteInclude(site) {
  const siteInclude = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["id", "shortName", "name", "direction"],
  };
  if (site) {
    siteInclude.where = {
      shortName: site,
    };
  }
  return siteInclude;
}

/**
 * The most often request is to display the flights of the current year. Therefore a cache for this request is introduced.
 * It is possible to use the cache, if only flights of the current year with no filter parameters are requested.
 *
 * @returns
 */
function isCacheSufficent(year, values) {
  return (
    year == new Date().getFullYear() && values.every((e) => e == undefined)
  );
}

module.exports = flightService;
