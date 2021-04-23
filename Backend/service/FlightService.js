const Flight = require("../model/Flight.js");

const flightService = {
  getAll: async () => {
    const flights = await Flight.findAll();
    console.log("Service: ", flights);
    return flights;
  },
  getById: async (flightId) => {
    const flights = await Flight.findOne({
      where: { id: flightId },
      include: { all: true },
    });
    console.log("Service: ", flights);
    return flights;
  },
  addResult: async (result) => {
    console.log("ADD RESULT TO FLIGHT");
    // const flights = await Flight.findOne({
    //   where: { id: flightId },
    //   include: { all: true },
    // });
    // console.log("Service: ", flights);
    // return flights;
  },
};

module.exports = flightService;
