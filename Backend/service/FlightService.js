const sequelize = require("sequelize");
const FlightComment = require("../config/postgres")["FlightComment"];
const Flight = require("../config/postgres")["Flight"];
const User = require("../config/postgres")["User"];
const FlyingSite = require("../config/postgres")["FlyingSite"];
const FlightFixes = require("../config/postgres")["FlightFixes"];

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

  getAll: async (year, site, type, ratingClass, limit, sortByPoints) => {
    let fillCache = false;
    if (isCacheSufficent(year, site, type, ratingClass, limit, sortByPoints)) {
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
      where: await createWhereStatement(year, type, ratingClass),
      order: [orderStatement],
    };

    if (limit) {
      queryObject.limit = limit;
    }

    const flights = await Flight.findAll(queryObject);

    if (fillCache) cacheManager.setCurrentYearFlightCache(flights);

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
          attributes: ["id", "description"],
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
          attributes: ["id", "description"],
        },
      ],
    });
    if (flightDbObject) {
      let flight = flightDbObject.toJSON();

      //TODO Merge directly when model is retrieved?
      flight.fixes = FlightFixes.mergeCoordinatesAndOtherData(flight.fixes);

      return flight;
    }
    return null;
  },

  update: async (flight) => {
    cacheManager.invalidateCaches();
    return flight.save();
  },

  delete: async (id) => {
    cacheManager.invalidateCaches();
    return await Flight.destroy({
      where: { id },
    });
  },

  addResult: async (result) => {
    cacheManager.invalidateCaches();
    console.log("ADD RESULT TO FLIGHT");
    const flight = await flightService.getById(result.flightId);

    flight.flightPoints = Math.round(result.pts);
    flight.flightDistance = result.dist;
    flight.flightType = result.type;

    const currentSeason = await getCurrentActive();
    const pointThreshold = currentSeason.pointThresholdForFlight;
    if (flight.flightPoints >= pointThreshold) {
      flight.flightStatus = flightService.STATE_IN_RANKING;
    } else {
      flight.flightStatus = flightService.STATE_NOT_IN_RANKING;
    }

    flight.flightTurnpoints = result.turnpoints;
    flight.igcUrl = result.igcUrl;

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
         * It is necessary to explicited call "changed", because a call to "save" will only updated data when a value has changed.
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
    return await Flight.create(flight);
  },

  startResultCalculation: async (flight) => {
    IgcAnalyzer.startCalculation(flight, (result) => {
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

    return flyingSite.description;
  },
};

async function retrieveDbObjectOfFlightFixes(flightId) {
  return await FlightFixes.findOne({
    where: {
      flightId: flightId,
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
  const result = await Flight.max("externalId");
  flight.externalId = result + 1;
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
  flight.ageOfUser = user.getAge();
}

async function createWhereStatement(year, flightType, ratingClass) {
  let whereStatement;
  if (flightType || year || ratingClass) {
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
  if (ratingClass) {
    const ratingValues =
      (await getCurrentActive()).ratingClasses[ratingClass] ?? [];
    whereStatement.glider = {
      type: { [sequelize.Op.in]: ratingValues },
    };
  }
  return whereStatement;
}

function createSiteInclude(site) {
  const siteInclude = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["id", "description", "name"],
  };
  if (site) {
    siteInclude.where = {
      name: site,
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
function isCacheSufficent(year, site, type, ratingClass, limit, sortByPoints) {
  return (
    year == new Date().getFullYear() &&
    !sortByPoints &&
    !site &&
    !type &&
    !ratingClass &&
    !limit
  );
}

module.exports = flightService;
