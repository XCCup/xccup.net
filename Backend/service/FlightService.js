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
const sequelize = require("sequelize");

const flightService = {
  STATE_IN_RANKING: "In Wertung",
  STATE_NOT_IN_RANKING: "Nicht in Wertung",
  STATE_FLIGHTBOOK: "Flugbuch",
  STATE_IN_PROCESS: "In Bearbeitung",

  FLIGHT_TYPES: ["FREE", "FLAT", "FAI"],

  getAll: async (year, site, type, ratingClass, limit, sortByPoints) => {
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
    return flight.save();
  },

  delete: async (id) => {
    return await Flight.destroy({
      where: { id },
    });
  },

  addResult: async (result) => {
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

async function addExternalId(flight) {
  const result = await Flight.max("externalId");
  flight.externalId = result + 1;
  console.log("New external ID was created: " + flight.externalId);
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

module.exports = flightService;
