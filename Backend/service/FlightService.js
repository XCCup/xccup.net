const { FlightComment, Flight, User } = require("../model/DependentModels");
const FlightFixes = require("../model/FlightFixes");
const IgcAnalyzer = require("../igc/IgcAnalyzer");
const { findTakeoffAndLanding } = require("../igc/LocationFinder");
const ElevationAttacher = require("../igc/ElevationAttacher");
const { getCurrentActive } = require("./SeasonService");
const { Sequelize } = require("sequelize");

const flightService = {
  STATE_IN_RANKING: "In Wertung",
  STATE_NOT_IN_RANKING: "Nicht in Wertung",
  STATE_FLIGHTBOOK: "Flugbuch",
  STATE_IN_PROCESS: "In Bearbeitung",

  getAll: async () => {
    const flights = await Flight.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });
    return flights;
  },

  getById: async (flightId) => {
    return await Flight.findOne({
      where: { id: flightId },
      include: [
        {
          model: FlightFixes,
          as: "fixes",
          attributes: ["fixes"],
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
          attributes: ["fixes"],
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
      ],
    });
    if (flightDbObject) {
      let flight = flightDbObject.toJSON();
      //DIRTY Move the fixes one layer up
      if (flight.fixes) {
        flight.fixes = flight.fixes.fixes;
      }
      return flight;
    }
    return null;
  },

  update: async (flight) => {
    return flight.save();
  },

  delete: async (flightId) => {
    const numberOfDestroyedRows = await Flight.destroy({
      where: { id: flightId },
    });
    console.log("Entries deleted: ", numberOfDestroyedRows);
    return numberOfDestroyedRows;
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
      flight.toJSON().fixes.fixes,
      async (fixesWithElevation) => {
        let flightFixes = await retrieveDbObjectOfFlightFixes(flight.id);
        flightFixes.fixes = fixesWithElevation;
        flightFixes.save();
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

    if (process.env.USE_GOOGLE_API === "true") {
      const places = await findTakeoffAndLanding(
        fixes[0],
        fixes[fixes.length - 1]
      );
      //TODO Replace Takeoff with entry in DB
      flight.takeoff = places.nameOfTakeoff;
      flight.landing = places.nameOfLanding;
    }

    FlightFixes.create({
      flightId: flight.id,
      fixes: fixes,
    });
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

module.exports = flightService;
