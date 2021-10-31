const FlyingSite = require("../config/postgres")["FlyingSite"];
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];

const seasonService = require("./SeasonService");
const userService = require("./UserService");
const sequelize = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");
const { TYPE, STATE } = require("../constants/flight-constants");
const {
  TEAM_DISMISSES,
  TEAM_SIZE,
  FLIGHTS_PER_USER,
  NEWCOMER_MAX_RANKING_CLASS,
} = require("../config/result-determination-config");

const cacheNonNewcomer = [];

const service = {
  getOverall: async (
    year,
    rankingClass,
    gender,
    isWeekend,
    isSenior,
    limit,
    site,
    region,
    state,
    club
  ) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail, isSenior);
    if (rankingClass) {
      const gliderClasses =
        seasonDetail.rankingClasses[rankingClass].gliderClasses ?? [];
      where.glider = {
        gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
      };
    }
    if (isWeekend) {
      where.isWeekend = true;
    }
    if (state) {
      where.homeStateOfUser = state;
    }
    const resultQuery = await queryDb(where, gender, null, site, region, club);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, FLIGHTS_PER_USER);
    sortDescendingByTotalPoints(result);

    return limit ? result.slice(0, limit) : result;
  },

  getClub: async (year, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, FLIGHTS_PER_USER);
    const resultOverClub = aggreateOverClubAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverClub);

    return limit ? resultOverClub.slice(0, limit) : resultOverClub;
  },

  getTeam: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where, null, null, null, region);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, FLIGHTS_PER_USER);
    const resultOverTeam = aggreateOverTeamAndCalcTotals(resultOverUser);
    dissmissWorstFlights(resultOverTeam);
    sortDescendingByTotalPoints(resultOverTeam);

    //TODO Entferne die schlechtesten drei Flüge des Teams (ggfs. ü. DB konfigurieren)

    return limit ? resultOverTeam.slice(0, limit) : resultOverTeam;
  },

  getSenior: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail, true);
    const resultQuery = await queryDb(where, null, null, null, region);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, FLIGHTS_PER_USER);
    calcSeniorBonusForFlightResult(result);
    sortDescendingByTotalPoints(result);

    return limit ? result.slice(0, limit) : result;
  },

  getNewcomer: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const gliderClasses =
      seasonDetail.rankingClasses[NEWCOMER_MAX_RANKING_CLASS].gliderClasses ??
      [];
    where.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };

    const resultQuery = await queryDb(where, null, null, null, region);

    const resultAllUsers = aggreateFlightsOverUser(resultQuery);
    const resultsNewcommer = await removeNonNewcomer(resultAllUsers, year);

    limitFlightsForUserAndCalcTotals(resultsNewcommer, FLIGHTS_PER_USER);
    calcSeniorBonusForFlightResult(resultsNewcommer);
    sortDescendingByTotalPoints(resultsNewcommer);

    return limit ? resultsNewcommer.slice(0, limit) : resultsNewcommer;
  },

  getSiteRecords: async () => {
    const freeRecords = findSiteRecordOfType(TYPE.FREE);
    const flatRecords = findSiteRecordOfType(TYPE.FLAT);
    const faiRecords = findSiteRecordOfType(TYPE.FAI);

    return await Promise.all([freeRecords, flatRecords, faiRecords]).then(
      (values) => {
        return mergeRecordsByTakeoffs(values);
      }
    );
  },
};

async function removeNonNewcomer(resultAllUsers, year) {
  const searchYear = year ? year : getCurrentYear();

  const resultsNewcomer = [];

  await Promise.all(
    resultAllUsers.map(async (fligthsOfUser) => {
      if (cacheNonNewcomer.includes(fligthsOfUser.user.id)) return;

      const numberOfFlightsInPreviosSeasons = await Flight.count({
        where: {
          flightStatus: STATE.IN_RANKING,
          userId: fligthsOfUser.user.id,
          andOp: sequelize.where(
            sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
            {
              [sequelize.Op.lt]: searchYear,
            }
          ),
        },
      });

      numberOfFlightsInPreviosSeasons > 0
        ? cacheNonNewcomer.push(fligthsOfUser.user.id)
        : resultsNewcomer.push(fligthsOfUser);
    })
  );

  return resultsNewcomer;
}

async function mergeRecordsByTakeoffs(records) {
  const allSites = await FlyingSite.findAll();
  return allSites.map((site) => {
    const freeSite = records[0].find((entry) => site.id == entry.takeoff.id);
    const flatSite = records[1].find((entry) => site.id == entry.takeoff.id);
    const faiSite = records[2].find((entry) => site.id == entry.takeoff.id);

    const res = { takeoff: {} };
    res.takeoff.id = site.id;
    res.takeoff.name = site.name;
    res.takeoff.shortName = site.shortName;
    res.free = createEntryOfRecord(freeSite);
    res.flat = createEntryOfRecord(flatSite);
    res.fai = createEntryOfRecord(faiSite);
    return res;
  });
}

function createEntryOfRecord(siteRecord) {
  const res = {};
  if (siteRecord) {
    res.user = siteRecord.User;
    res.flightId = siteRecord.id;
    res.points = siteRecord.flightPoints;
    res.distance = siteRecord.flightDistance;
  } else {
    res.user = null;
    res.flightId = null;
    res.points = 0;
    res.distance = 0;
  }
  return res;
}

async function findSiteRecordOfType(type) {
  return Flight.findAll({
    include: [
      {
        model: FlyingSite,
        as: "takeoff",
        attributes: ["name", "id", "shortName"],
      },
      {
        model: User,
        attributes: ["firstName", "lastName", "id"],
      },
    ],
    where: {
      flightType: type,
    },
    attributes: [
      "id",
      "flightPoints",
      "flightDistance",
      "flightType",
      [sequelize.fn("max", sequelize.col("flightPoints")), "maxFlightPoints"],
    ],
    group: [
      "User.id",
      "User.firstName",
      "User.lastName",
      "Flight.id",
      "Flight.flightPoints",
      "Flight.flightDistance",
      "Flight.flightType",
      "takeoff.name",
      "takeoff.id",
      "takeoff.shortName",
    ],
  });
}

async function queryDb(where, gender, limit, site, region, club) {
  const userInclude = createIncludeStatementUser(gender);
  const siteInclude = createIncludeStatementSite(site, region);
  const clubInclude = {
    model: Club,
    attributes: ["name", "shortName", "id"],
  };
  if (club) {
    clubInclude.where = {
      shortName: club,
    };
  }
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
    takeoffTime: {
      [sequelize.Op.between]: [seasonDetail.startDate, seasonDetail.endDate],
    },
    flightStatus: STATE.IN_RANKING,
    airspaceViolation: false,
    uncheckedGRecord: false,
  };

  if (isSenior) {
    where.ageOfUser = {
      [sequelize.Op.gte]: seasonDetail.seniorStartAge,
    };
  }

  return where;
}

function createIncludeStatementUser(gender) {
  const userInclude = {
    model: User,
    attributes: ["firstName", "lastName", "id", "gender", "birthday"],
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
    attributes: ["name", "shortName", "id", "region"],
  };
  if (site) {
    siteInclude.where = {
      shortName: site,
    };
  }
  if (region) {
    siteInclude.where = {
      region,
    };
  }
  return siteInclude;
}

function limitFlightsForUserAndCalcTotals(resultArray, maxNumberOfFlights) {
  console.log("CACHE: ", cacheNonNewcomer);

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
    const found = result.find((e) => e.clubId == entry.club.id);
    const memberEntry = {
      id: entry.userId,
      firstName: entry.userFirstName,
      lastName: entry.userLastName,
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
        clubName: entry.club.name,
        clubId: entry.club.id,
        members: [memberEntry],
        totalDistance: memberEntry.totalPoints,
        totalPoints: memberEntry.totalPoints,
      });
    }
  });
  return result;
}

function dissmissWorstFlights(resultOverTeam) {
  resultOverTeam.forEach((team) => {
    let flights = [];
    team.members.forEach((member) => {
      flights = flights.concat(member.flights);
    });
    const numberOfFlightsToDismiss =
      flights.length - FLIGHTS_PER_USER * TEAM_SIZE + TEAM_DISMISSES;
    if (numberOfFlightsToDismiss > 0) {
      console.log("DISMISS");
      flights.sort((a, b) => b.flightPoints - a.flightPoints);
      flights.forEach((e) => console.log(e.flightPoints));
      const worstFlights = flights.splice(numberOfFlightsToDismiss * -1);
      worstFlights.forEach((e) => console.log(e.flightPoints));
      //TODO Remove finally flights from result object
    }
  });
}

function aggreateOverTeamAndCalcTotals(resultOverUser) {
  const result = [];
  resultOverUser.forEach((entry) => {
    const found = result.find((e) => e.teamId == entry.team.id);
    const memberEntry = {
      id: entry.user.id,
      firstName: entry.user.firstName,
      lastName: entry.user.lastName,
      flights: entry.flights,
      totalDistance: entry.totalDistance,
      totalPoints: entry.totalPoints,
    };
    if (found) {
      found.members.push(memberEntry);
      found.totalPoints += memberEntry.totalPoints;
      found.totalDistance += memberEntry.totalDistance;
    } else if (entry.team.name) {
      //Prevention for users with no team association
      result.push({
        teamName: entry.team.name,
        teamId: entry.team.id,
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
    const found = result.find((e) => e.user.id == entry.User.id);
    const flightEntry = {
      id: entry.id,
      flightPoints: entry.flightPoints,
      flightDistance: Math.round(entry.flightDistance * 100) / 100,
      glider: entry.glider,
      flightType: entry.flightType,
      takeoffName: entry.takeoff.name,
      takeoffShortName: entry.takeoff.shortName,
      takeoffId: entry.takeoff.id,
      takeoffRegion: entry.takeoff.region,
      ageOfUser: entry.ageOfUser,
    };
    if (found) {
      found.flights.push(flightEntry);
    } else {
      result.push({
        user: {
          id: entry.User.id,
          firstName: entry.User.firstName,
          lastName: entry.User.lastName,
          gender: entry.User.gender,
        },
        club: {
          name: entry.Club.name, //A user must always belong to a club
          id: entry.Club.id,
        },
        team: {
          name: entry.Team?.name, //It is possible that a user has no team
          id: entry.Team?.id,
        },
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
    year && year != getCurrentYear()
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
