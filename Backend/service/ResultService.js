const { Flight, User, FlyingSite } = require("../model/DependentModels");
const seasonService = require("./SeasonService");
const { Op } = require("sequelize");
const userService = require("./UserService");

const service = {
  getOverall: async (
    year,
    ratingClass,
    gender,
    isWeekend,
    limit,
    site,
    region
  ) => {
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
    const resultQuery = await queryDb(where, gender, limit, site, region);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsAndCalculateTotals(result, 3);
    sortDescendingByTotalPoints(result);

    return result;
  },
};

async function queryDb(where, gender, limit, site, region) {
  const userInclude = {
    model: User,
    attributes: ["name", "id", "gender"],
  };
  if (gender) {
    userInclude.where = {
      gender: gender ? gender : userService.GENDERS,
    };
  }

  const siteInclude = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["name", "id", "region"],
  };
  if (site) {
    siteInclude.where = {
      name: site,
    };
  }
  if (region) {
    siteInclude.where = {
      region: region,
    };
  }

  const queryObject = {
    where,
    include: [userInclude, siteInclude],
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
      takeoffName: entry.takeoff.name,
      takeoffId: entry.takeoff.id,
      takeoffRegion: entry.takeoff.region,
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
