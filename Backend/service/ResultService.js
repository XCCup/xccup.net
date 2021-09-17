const FlyingSite = require("../config/postgres")["FlyingSite"];
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];
const seasonService = require("./SeasonService");
const { Op } = require("sequelize");
const userService = require("./UserService");

//TODO Was passiert mit alten Flügen die gelöscht wurden? Aktuell würde die Wertung für diese Jahre nachträglich angepasst. Das sollte vermieden werden

//TODO Implement newcomer result

const service = {
  getOverall: async (
    year,
    ratingClass,
    gender,
    isWeekend,
    isSenior,
    limit,
    site,
    region,
    state
  ) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail, isSenior);
    if (ratingClass) {
      const ratingValues = seasonDetail.ratingClasses[ratingClass] ?? [];
      where.glider = {
        type: { [Op.in]: ratingValues },
      };
    }
    if (isWeekend) {
      where.isWeekend = true;
    }
    if (state) {
      where.homeStateOfUser = state;
    }
    const resultQuery = await queryDb(where, gender, null, site, region);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, 3);
    sortDescendingByTotalPoints(result);

    return limit ? result.slice(0, limit) : result;
  },

  getClub: async (year, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, 3);
    const resultOverClub = aggreateOverClubAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverClub);

    return limit ? resultOverClub.slice(0, limit) : resultOverClub;
  },

  getTeam: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where, null, null, null, region);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, 3);
    const resultOverTeam = aggreateOverTeamAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverTeam);

    return limit ? resultOverTeam.slice(0, limit) : resultOverTeam;
  },

  getSenior: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail, true);
    const resultQuery = await queryDb(where, null, null, null, region);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, 3);
    calcSeniorBonusForFlightResult(result);
    sortDescendingByTotalPoints(result);

    return limit ? result.slice(0, limit) : result;
  },

  getSiteRecords: async () => {
    // const where = createDefaultWhereForFlight(seasonDetail, true);
    // const resultQuery = await queryDb(where, null, null, null, region);
    // return limit ? result.slice(0, limit) : result;
  },
};

async function queryDb(where, gender, limit, site, region) {
  const userInclude = createIncludeStatementUser(gender);
  const siteInclude = createIncludeStatementSite(site, region);
  const clubInclude = {
    model: Club,
    attributes: ["name", "id"],
  };
  const teamInclude = {
    model: Team,
    attributes: ["name", "id"],
  };

  const queryObject = {
    where,
    include: [userInclude, siteInclude, clubInclude, teamInclude],
    attributes: [
      "id",
      "flightPoints",
      "flightDistance",
      "glider",
      "flightType",
      "ageOfUser",
    ],
    order: [["flightPoints", "DESC"]],
  };
  if (limit) {
    queryObject.limit = limit;
  }
  return Flight.findAll(queryObject);
}

function createDefaultWhereForFlight(seasonDetail, isSenior) {
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

  if (isSenior) {
    where.ageOfUser = {
      [Op.gte]: seasonDetail.seniorStartAge,
    };
  }

  return where;
}

function createIncludeStatementUser(gender) {
  const userInclude = {
    model: User,
    attributes: ["name", "id", "gender", "birthday"],
  };
  if (gender) {
    userInclude.where.gender = gender
      ? gender.toUpperCase()
      : userService.GENDERS;
  }
  return userInclude;
}
function createIncludeStatementSite(site, region) {
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
  return siteInclude;
}

function limitFlightsForUserAndCalcTotals(resultArray, maxNumberOfFlights) {
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

function aggreateOverClubAndCalcTotals(resultOverUser) {
  const result = [];
  resultOverUser.forEach((entry) => {
    const found = result.find((e) => e.clubId == entry.clubId);
    const memberEntry = {
      id: entry.userName,
      name: entry.userId,
      flights: entry.flights,
      totalDistance: entry.totalDistance,
      totalPoints: entry.totalPoints,
    };
    if (found) {
      found.members.push(memberEntry);
      found.totalPoints += memberEntry.totalPoints;
      found.totalDistance += memberEntry.totalDistance;
    } else {
      result.push({
        clubName: entry.clubName,
        clubId: entry.clubId,
        members: [memberEntry],
        totalDistance: memberEntry.totalPoints,
        totalPoints: memberEntry.totalPoints,
      });
    }
  });
  return result;
}

function aggreateOverTeamAndCalcTotals(resultOverUser) {
  const result = [];
  resultOverUser.forEach((entry) => {
    const found = result.find((e) => e.teamId == entry.teamId);
    const memberEntry = {
      id: entry.userName,
      name: entry.userId,
      flights: entry.flights,
      totalDistance: entry.totalDistance,
      totalPoints: entry.totalPoints,
    };
    if (found) {
      found.members.push(memberEntry);
      found.totalPoints += memberEntry.totalPoints;
      found.totalDistance += memberEntry.totalDistance;
    } else if (entry.teamName) {
      //Prevention for users with no team association
      result.push({
        teamName: entry.teamName,
        teamId: entry.teamId,
        members: [memberEntry],
        totalDistance: memberEntry.totalPoints,
        totalPoints: memberEntry.totalPoints,
      });
    }
  });
  return result;
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
      ageOfUser: entry.ageOfUser,
    };
    if (found) {
      found.flights.push(flightEntry);
    } else {
      result.push({
        userName: entry.User.name,
        userId: entry.User.id,
        gender: entry.User.gender,
        clubName: entry.Club.name, //A user must always belong to a club
        clubId: entry.Club.id,
        teamName: entry.Team?.name, //It is possible that a user has no team
        teamId: entry.Team?.id,
        flights: [flightEntry],
      });
    }
  });
  return result;
}
/**
 * Sorts an array of result objects descending by the value of the "totalPoints" field of each entry.
 * @param {*} resultArray The result array to be sorted.
 */
function sortDescendingByTotalPoints(resultArray) {
  resultArray.sort((a, b) => b.totalPoints - a.totalPoints);
}

async function retrieveSeasonDetails(year) {
  const seasonDetail =
    year && year != new Date().getFullYear()
      ? await seasonService.getByYear(year)
      : seasonService.getCurrentActive();
  return seasonDetail;
}

function calcSeniorBonusForFlight(age) {
  const seasonDetail = seasonService.getCurrentActive();
  const bonusPerYear = seasonDetail.seniorBonusPerAge;
  const startAge = seasonDetail.seniorStartAge;
  return age > startAge ? bonusPerYear * (age - startAge) : 0;
}

function calcSeniorBonusForFlightResult(result) {
  result.forEach((entry) => {
    let totalPoints = 0;
    entry.flights.forEach((flight) => {
      flight.flightPoints *=
        (100 + calcSeniorBonusForFlight(flight.ageOfUser)) / 100;
      totalPoints += flight.flightPoints;
    });
    entry.totalPoints = totalPoints;
  });
}

module.exports = service;
