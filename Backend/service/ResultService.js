const { Flight, User } = require("../model/DependentModels");
const seasonService = require("./SeasonService");
const { Op } = require("sequelize");
const userService = require("./UserService");

const service = {
  getOverall: async (year, ratingClass, gender, isWeekend, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = {
      dateOfFlight: {
        [Op.between]: [seasonDetail.startDate, seasonDetail.endDate],
      },
      flightPoints: {
        [Op.gte]: seasonDetail.pointThresholdForFlight,
      },
      airspaceViolation: false,
      uncheckedGRecord: false,
    };
    if (ratingClass) {
      where.glider = {
        type: ratingClass,
      };
    }
    if (isWeekend) {
      where.isWeekend = true;
    }
    const resultQuery = await queryDb(where, gender, limit);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsAndCalculateTotals(result, 3);
    sortDescendingByTotalPoints(result);

    return result;
  },
};

async function queryDb(where, gender, limit) {
  const queryObject = {
    where,
    include: {
      model: User,
      attributes: ["name", "id", "gender"],
      where: {
        gender: gender ? gender : userService.GENDERS,
      },
    },
    attributes: [
      "id",
      "flightPoints",
      "flightDistance",
      "glider",
      "flightType",
    ],
    order: [["flightPoints", "DESC"]],
  };
  if (limit) {
    queryObject.limit = limit;
  }
  return Flight.findAll(queryObject);
}

function limitFlightsAndCalculateTotals(resultArray, maxNumberOfFlights) {
  resultArray.forEach((entry) => {
    entry.totalFlights = entry.flights.length;

    entry.flights = entry.flights.slice(0, maxNumberOfFlights);

    entry.totalDistance = entry.flights.reduce(
      (acc, cur) => acc + cur.flightDistance,
      0
    );
    entry.totalPoints = entry.flights.reduce(
      (acc, cur) => acc + cur.flightPoints,
      0
    );
  });
}

function aggreateFlightsOverUser(resultQuery) {
  const result = [];
  resultQuery.forEach((entry) => {
    const found = result.find((e) => e.userName == entry.User.name);
    const flightEntry = {
      id: entry.id,
      flightPoints: entry.flightPoints,
      flightDistance: entry.flightDistance,
      glider: entry.glider,
      flightType: entry.flightType,
    };
    if (found) {
      found.flights.push(flightEntry);
    } else {
      result.push({
        userName: entry.User.name,
        userId: entry.User.id,
        gender: entry.User.gender,
        flights: [flightEntry],
      });
    }
  });
  return result;
}

function sortDescendingByTotalPoints(resultArray) {
  resultArray.sort((a, b) => b.totalPoints - a.totalPoints);
}

async function retrieveSeasonDetails(year) {
  const requestedYear = year ?? new Date().getFullYear();
  const seasonDetail =
    (await seasonService.getByYear(requestedYear)) ??
    (await seasonService.getCurrentActive());
  return seasonDetail;
}

module.exports = service;
