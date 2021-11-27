const FlyingSite = require("../config/postgres")["FlyingSite"];
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];

const seasonService = require("./SeasonService");
const sequelize = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");
const { TYPE, STATE } = require("../constants/flight-constants");
const { GENDER } = require("../constants/user-constants");
const {
  TEAM_DISMISSES,
  TEAM_SIZE,
  NUMBER_OF_SCORED_FLIGHTS,
  NEWCOMER_MAX_RANKING_CLASS,
} = require("../config/result-determination-config");

const logger = require("../config/logger");

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
    limitFlightsForUserAndCalcTotals(result, NUMBER_OF_SCORED_FLIGHTS);
    sortDescendingByTotalPoints(result);

    return addConstantInformationToResult(
      result,
      { NUMBER_OF_SCORED_FLIGHTS },
      limit
    );
  },

  getClub: async (year, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, NUMBER_OF_SCORED_FLIGHTS);
    const resultOverClub = aggreateOverClubAndCalcTotals(resultOverUser);
    sortDescendingByTotalPoints(resultOverClub);

    return addConstantInformationToResult(
      resultOverClub,
      { NUMBER_OF_SCORED_FLIGHTS },
      limit
    );
  },

  getTeam: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail);
    const resultQuery = await queryDb(where, null, null, null, region);

    const resultOverUser = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(resultOverUser, NUMBER_OF_SCORED_FLIGHTS);
    const resultOverTeam = aggreateOverTeamAndCalcTotals(resultOverUser);
    dissmissWorstFlights(resultOverTeam);
    sortDescendingByTotalPoints(resultOverTeam);

    //TODO Entferne die schlechtesten drei Flüge des Teams (ggfs. ü. DB konfigurieren)

    return addConstantInformationToResult(
      resultOverTeam,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        TEAM_DISMISSES,
        TEAM_SIZE,
      },
      limit
    );
  },

  getSenior: async (year, region, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const where = createDefaultWhereForFlight(seasonDetail, true);
    const resultQuery = await queryDb(where, null, null, null, region);

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, NUMBER_OF_SCORED_FLIGHTS);
    calcSeniorBonusForFlightResult(result);
    sortDescendingByTotalPoints(result);

    return addConstantInformationToResult(
      result,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        SENIOR_START_AGE: seasonDetail.seniorStartAge,
        SENIOR_BONUS_PER_AGE: seasonDetail.seniorBonusPerAge,
      },
      limit
    );
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
    const resultsNewcomer = await removeNonNewcomer(resultAllUsers, year);

    limitFlightsForUserAndCalcTotals(resultsNewcomer, NUMBER_OF_SCORED_FLIGHTS);
    calcSeniorBonusForFlightResult(resultsNewcomer);
    sortDescendingByTotalPoints(resultsNewcomer);

    return addConstantInformationToResult(
      resultsNewcomer,
      { NUMBER_OF_SCORED_FLIGHTS, NEWCOMER_MAX_RANKING_CLASS },
      limit
    );
  },

  getSiteRecords: async () => {
    const freeRecords = findSiteRecordOfType(TYPE.FREE);
    const flatRecords = findSiteRecordOfType(TYPE.FLAT);
    const faiRecords = findSiteRecordOfType(TYPE.FAI);

    const records = await Promise.all([freeRecords, flatRecords, faiRecords]);

    return mergeRecordsByTakeoffs(records);
  },
};

function addConstantInformationToResult(result, constants, limit) {
  return {
    constants,
    values: limit ? result.slice(0, limit) : result,
  };
}

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
  const results = [];

  for (let index = 0; index < records[0].length; index++) {
    const combinedResult = { takeoff: {} };
    combinedResult.takeoff.id = records[0][index].id;
    combinedResult.takeoff.name = records[0][index].name;
    combinedResult.takeoff.shortName = records[0][index].shortName;
    combinedResult.free = createEntryOfRecord(records[0][index].flights[0]);
    combinedResult.flat = createEntryOfRecord(records[1][index].flights[0]);
    combinedResult.fai = createEntryOfRecord(records[2][index].flights[0]);
    results.push(combinedResult);
  }

  return results;
}

function createEntryOfRecord(siteRecord) {
  if (siteRecord) {
    return {
      user: siteRecord.user,
      flightId: siteRecord.id,
      externalId: siteRecord.externalId,
      takeoffTime: siteRecord.takeoffTime,
      points: siteRecord.flightPoints,
      distance: siteRecord.flightDistance,
      glider: siteRecord.glider,
    };
  }
  return null;
}

async function findSiteRecordOfType(type) {
  return FlyingSite.findAll({
    include: [
      {
        model: Flight,
        as: "flights",
        attributes: [
          "id",
          "externalId",
          "flightPoints",
          "flightDistance",
          "userId",
          "takeoffTime",
          "glider",
        ],
        where: {
          flightType: type,
          flightPoints: {
            [sequelize.Op.not]: null,
          },
        },
        order: [["flightPoints", "DESC"]],
        limit: 1,
        include: {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "id"],
        },
      },
    ],
    attributes: ["id", "name", "shortName"],
    order: [["name"]],
  });
}

async function queryDb(where, gender, limit, site, region, club) {
  const userInclude = createIncludeStatementUser(gender);
  const siteInclude = createIncludeStatementSite(site, region);
  const clubInclude = {
    model: Club,
    as: "club",
    attributes: ["name", "shortName", "id"],
  };
  if (club) {
    clubInclude.where = {
      shortName: club,
    };
  }
  const teamInclude = {
    model: Team,
    as: "team",
    attributes: ["name", "id"],
  };

  const queryObject = {
    where,
    include: [userInclude, siteInclude, clubInclude, teamInclude],
    attributes: [
      "id",
      "externalId",
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
      [sequelize.Op.between]: [seasonDetail?.startDate, seasonDetail?.endDate],
    },
    flightStatus: STATE.IN_RANKING,
    [sequelize.Op.or]: [
      { violationAccepted: true },
      {
        [sequelize.Op.and]: [
          { uncheckedGRecord: false },
          { airspaceViolation: false },
        ],
      },
    ],
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
    as: "user",
    attributes: ["firstName", "lastName", "id", "gender", "birthday"],
  };
  if (gender) {
    userInclude.where = {
      gender: gender ? gender.toUpperCase() : Object.values(GENDER),
    };
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
      flights.length - NUMBER_OF_SCORED_FLIGHTS * TEAM_SIZE + TEAM_DISMISSES;
    if (numberOfFlightsToDismiss > 0) {
      logger.warn("DISMISS");
      flights.sort((a, b) => b.flightPoints - a.flightPoints);
      flights.forEach((e) => logger.debug(e.flightPoints));
      const worstFlights = flights.splice(numberOfFlightsToDismiss * -1);
      worstFlights.forEach((e) => logger.debug(e.flightPoints));
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
    const found = result.find((e) => e.user.id == entry.user.id);
    const flightEntry = {
      id: entry.id,
      externalId: entry.externalId,
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
          id: entry.user.id,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          gender: entry.user.gender,
        },
        club: {
          name: entry.club.name, //A user must always belong to a club
          id: entry.club.id,
        },
        team: {
          name: entry.team?.name, //It is possible that a user has no team
          id: entry.team?.id,
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
