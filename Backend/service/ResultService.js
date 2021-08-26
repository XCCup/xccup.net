const { Flight, User } = require("../model/DependentModels");
const { Op } = require("sequelize");

const service = {
  overall: async () => {
    const resultQuery = await Flight.findAll({
      where: {
        dateOfFlight: {
          [Op.between]: ["2021-02-01 00:00:00", "2021-09-30 00:00:00"],
        },
        flightPoints: {
          [Op.gte]: 60,
        },
        airspaceViolation: false,
        uncheckedGRecord: false,
      },
      include: {
        model: User,
        attributes: ["name", "id"],
      },
      attributes: ["id", "flightPoints", "flightDistance"],
    });

    const result = [];

    //Aggregate all flights over pilots
    resultQuery.forEach((entry) => {
      const found = result.find((e) => e.name == entry.User.name);
      if (found) {
        found.flights.push(entry);
      } else {
        result.push({
          name: entry.User.name,
          flights: [entry],
        });
      }
    });

    result.forEach((entry) => {
      entry.totalFlights = 0;
      //Sort flights of a pilot descending by points
      entry.flights.sort((a, b) => b.flightPoints - a.flightPoints);
      //Use only the 3 best flights
      entry.totalFlights = entry.flights.length;
      entry.flights = entry.flights.slice(0, 3);
    });

    //Aggregate points and distance over remaining flights
    result.forEach((entry) => {
      entry.totalDistance = entry.flights.reduce(
        (acc, cur) => acc + cur.flightDistance,
        0
      );
      entry.totalPoints = entry.flights.reduce(
        (acc, cur) => acc + cur.flightPoints,
        0
      );
    });

    //Sort results descending by totalPoints
    result.sort((a, b) => b.totalPoints - a.totalPoints);

    return result;
  },
};

module.exports = service;
