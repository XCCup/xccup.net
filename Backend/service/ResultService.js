const FlyingSite = require("../config/postgres")["FlyingSite"];
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];
const Result = require("../config/postgres")["Result"];
const seasonService = require("./SeasonService");
const { Op } = require("sequelize");
const userService = require("./UserService");

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
    const resultQuery = await queryDb(
      where,
      gender,
      limit,
      site,
      region,
      isSenior,
      state
    );

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, 3);
    sortDescendingByTotalPoints(result);

    return result;
  },

  getClub: async (year) => {
    if (year && new Date().getFullYear() != year) {
      const oldResult = findOldResult(year, "club");
      if (oldResult) return oldResult;
    }

    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, 3);
    const resultOverClub = aggreateOverClubAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverClub);

    return resultOverClub;
  },

  getTeam: async (year, region) => {
    if (year && new Date().getFullYear() != year) {
      const oldResult = await findOldResult(year, "team");
      if (oldResult) return oldResult;
    }

    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where, null, null, null, region);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, 3);
    const resultOverTeam = aggreateOverTeamAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverTeam);

    return resultOverTeam;
  },
};

async function queryDb(where, gender, limit, site, region, isSenior, state) {
  const userInclude = createIncludeStatementUser(gender, isSenior, state);
  const siteInclude = createIncludeStatementSite(site, region);

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

async function findOldResult(year, type) {
  if (year && type) {
    return Result.findOne({
      where: {
        season: year,
        type: type,
      },
    });
  }
  return null;
}

function createDefaultWhereForFlight(seasonDetail) {
  return {
    dateOfFlight: {
      [Op.between]: [seasonDetail.startDate, seasonDetail.endDate],
    },
    flightPoints: {
      [Op.gte]: seasonDetail.pointThresholdForFlight,
    },
    airspaceViolation: false,
    uncheckedGRecord: false,
  };
}

function createIncludeStatementUser(gender, isSenior, state) {
  const clubInclude = {
    model: Club,
    attributes: ["name", "id"],
  };
  const teamInclude = {
    model: Team,
    attributes: ["name", "id"],
  };
  const userInclude = {
    model: User,
    attributes: ["name", "id", "gender"],
    include: [clubInclude, teamInclude],
  };
  if (gender || isSenior || state) {
    userInclude.where = {};
  }
  if (gender) {
    userInclude.where.gender = gender
      ? gender.toUpperCase()
      : userService.GENDERS;
  }
  if (state) {
    userInclude.where.state = state;
  }
  if (isSenior) {
    userInclude.where.birthday = {
      [Op.lt]: new Date(new Date().getFullYear() - 60, 1), //TODO Make the value (60) a check against db
    };
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
    };
    if (found) {
      found.flights.push(flightEntry);
    } else {
      result.push({
        userName: entry.User.name,
        userId: entry.User.id,
        gender: entry.User.gender,
        clubName: entry.User.Club.name, //A user must always belong to a club
        clubId: entry.User.Club.id,
        teamName: entry.User.Team?.name, //It is possible that a user has no team
        teamId: entry.User.Team?.id,
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
  const requestedYear = year ?? new Date().getFullYear();
  const seasonDetail =
    (await seasonService.getByYear(requestedYear)) ??
    (await seasonService.getCurrentActive());
  return seasonDetail;
}

module.exports = service;
