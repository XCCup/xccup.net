const Flight = require("../model/Flight.js");
const FlightFixes = require("../model/FlightFixes");
const IgcAnalyzer = require("../igc/IgcAnalyzer");
const { findTakeoffAndLanding } = require("../igc/LocationFinder");
const ElevationAttacher = require("../igc/ElevationAttacher");
const FlightComment = require("../model/FlightComment.js");

const flightService = {
  getAll: async () => {
    const flights = await Flight.findAll();
    return flights;
  },

  getById: async (flightId) => {
    return await Flight.findByPk(flightId);
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
    } else {
      return null;
    }
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
    const flight = await Flight.findOne({
      where: { id: result.flightId },
    });

    flight.flightPoints = Math.round(result.pts);
    flight.flightDistance = result.dist;
    flight.flightType = result.type;
    //TODO Replace threshold value by db query
    if (flight.flightPoints >= 60) {
      flight.flightStatus = "In Wertung";
    } else {
      flight.flightStatus = "Nicht in Wertung";
    }
    flight.flightTurnpoints = result.turnpoints;
    flight.igcUrl = result.igcUrl;

    const fixes = IgcAnalyzer.extractFixes(flight);
    ElevationAttacher.execute(fixes, (fixesWithElevation) => {
      // flight.fixes = fixesWithElevation;
      FlightFixes.create({
        flightId: flight.id,
        fixes: fixesWithElevation,
      });
    });

    if (process.env.USE_GOOGLE_API === true) {
      const places = await findTakeoffAndLanding(
        fixes[0],
        fixes[fixes.length - 1]
      );
      flight.takeoff = places.nameOfTakeoff;
      flight.takeoff = places.nameOfLanding;
    }

    flight.save();
  },

  create: async (flight) => {
    return await Flight.create(flight);
  },

  startResultCalculation: async (flight) => {
    IgcAnalyzer.startCalculation(flight, (result) => {
      flightService.addResult(result);
    });
  },
};

module.exports = flightService;
