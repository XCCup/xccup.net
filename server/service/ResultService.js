const FlyingSite = require("../config/postgres")["FlyingSite"];
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];
const Result = require("../config/postgres")["Result"];

const seasonService = require("./SeasonService");
const teamService = require("./TeamService");
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
const moment = require("moment");
const { XccupHttpError } = require("../helper/ErrorHandler");
const { NOT_FOUND } = require("../constants/http-status-constants");

const cacheNonNewcomer = [];
const RANKINGS = {
  OVERALL: "overall",
  LADIES: "ladies",
  CLUB: "club",
  TEAM: "team",
  SENIORS: "seniors",
  NEWCOMER: "newcomer",
  LUX: "LUX",
  RP: "RP",
};

const service = {
  getOverall: async ({
    year,
    rankingClass,
    gender,
    homeStateOfUser,
    isSenior,
    isWeekend,
    isHikeAndFly,
    site,
    siteId,
    siteRegion,
    club,
    clubId,
    limit,
  }) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    if (
      year < 2022 &&
      !(
        rankingClass ||
        gender ||
        homeStateOfUser ||
        isSenior ||
        isWeekend ||
        isHikeAndFly ||
        siteId ||
        clubId
      )
    ) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.OVERALL);

      const oldResult = await findOldResult(year, RANKINGS.OVERALL);
      if (oldResult)
        return addConstantInformationToResult(oldResult, {
          NUMBER_OF_SCORED_FLIGHTS,
        });
    }
    // Things like this would be easier to understand if they were commented.
    if (
      year < 2022 &&
      gender == GENDER.FEMALE &&
      !(
        rankingClass ||
        homeStateOfUser ||
        isSenior ||
        isWeekend ||
        isHikeAndFly ||
        siteId ||
        clubId
      )
    ) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.LADIES);
      const oldResult = await findOldResult(year, RANKINGS.LADIES);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          { NUMBER_OF_SCORED_FLIGHTS },
          limit
        );
    }

    const where = createDefaultWhereForFlight({ seasonDetail, isSenior });
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
    if (isHikeAndFly) {
      where.hikeAndFly = {
        [sequelize.Op.gt]: 0,
      };
    }
    if (homeStateOfUser) {
      where.homeStateOfUser = homeStateOfUser;
    }
    const resultQuery = await queryDb({
      where,
      gender,
      site,
      siteId,
      siteRegion,
      club,
      clubId,
    });

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

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.CLUB);
      const oldResult = await findOldResult(year, RANKINGS.CLUB);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          { NUMBER_OF_SCORED_FLIGHTS },
          limit
        );
    }

    const where = createDefaultWhereForFlight({ seasonDetail });
    const resultQuery = await queryDb({ where });

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

  getTeam: async (year, siteRegion, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.TEAM);
      const oldResult = await findOldResult(year, RANKINGS.TEAM);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          {
            NUMBER_OF_SCORED_FLIGHTS,
            TEAM_DISMISSES,
            TEAM_SIZE,
            REMARKS: seasonDetail.misc?.textMessages?.resultsTeam,
          },
          limit
        );
    }

    const teamsOfSeason = await teamService.getAll({
      year,
    });

    await Promise.all(
      teamsOfSeason.map(async (team) => {
        await Promise.all(
          team.members.map(async (member) => {
            const where = createDefaultWhereForFlight({ seasonDetail });
            where.userId = member.id;
            member.flights = (
              await queryDb({
                where,
                limit: NUMBER_OF_SCORED_FLIGHTS,
                siteRegion,
                useIncludes: ["site"],
              })
            ).map((e) => e.toJSON());
          })
        );

        markFlightsToDismiss(team);

        team.members.forEach((member) => {
          calcTotalsOfMember(member);
        });
        calcTotalsOverMembers(team);
        sortDescendingByTotalPoints(team.members);
      })
    );

    sortDescendingByTotalPoints(teamsOfSeason);

    return addConstantInformationToResult(
      teamsOfSeason,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        TEAM_DISMISSES,
        TEAM_SIZE,
        REMARKS: seasonDetail.misc?.textMessages?.resultsTeams,
      },
      limit
    );
  },

  getSenior: async (year, siteRegion, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.SENIORS);
      const oldResult = await findOldResult(year, RANKINGS.SENIORS);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          {
            NUMBER_OF_SCORED_FLIGHTS,
            SENIOR_START_AGE: seasonDetail.seniorStartAge,
            SENIOR_BONUS_PER_AGE: seasonDetail.seniorBonusPerAge,
            REMARKS: seasonDetail.misc?.textMessages?.resultsSeniors,
          },
          limit
        );
    }

    const where = createDefaultWhereForFlight({ seasonDetail, isSenior: true });
    const resultQuery = await queryDb({ where, siteRegion });

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, NUMBER_OF_SCORED_FLIGHTS);
    await calcSeniorBonusForFlightResult(result);
    sortDescendingByTotalPoints(result);

    return addConstantInformationToResult(
      result,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        SENIOR_START_AGE: seasonDetail.seniorStartAge,
        SENIOR_BONUS_PER_AGE: seasonDetail.seniorBonusPerAge,
        REMARKS: seasonDetail.misc?.textMessages?.resultsSeniors,
      },
      limit
    );
  },

  /**
   * Calculate the results for rlp cup.
   *
   * @param {*} year The year to calculate the ranking for
   * @param {*} limit The limit of results to retrieve
   * @returns The results of the ranking  of the provided year
   */
  getRhineland: async (year, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.RP);
      const oldResult = await findOldResult(year, RANKINGS.RP);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          {
            NUMBER_OF_SCORED_FLIGHTS,
            REMARKS_STATE: seasonDetail.misc?.textMessages?.resultsState,
          },
          limit
        );
    }

    const where = createDefaultWhereForFlight({ seasonDetail });
    where.homeStateOfUser = RANKINGS.RP;

    const resultQuery = await queryDb({ where, siteState: RANKINGS.RP });

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, NUMBER_OF_SCORED_FLIGHTS);
    sortDescendingByTotalPoints(result);

    return addConstantInformationToResult(
      result,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        REMARKS_STATE: seasonDetail.misc?.textMessages?.resultsState,
      },
      limit
    );
  },

  /**
   * Calculate the results for luxemburg ranking.
   *
   * @param {*} year The year to calculate the ranking for
   * @param {*} limit The limit of results to retrieve
   * @returns The results of the ranking of the provided year
   */
  getLuxemburg: async (year, limit) => {
    const NUMBER_OF_SCORED_FLIGHTS_LUX = 6;

    const seasonDetail = await retrieveSeasonDetails(year);

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.LUX);
      const oldResult = await findOldResult(year, RANKINGS.LUX);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          {
            NUMBER_OF_SCORED_FLIGHTS: NUMBER_OF_SCORED_FLIGHTS_LUX,
            REMARKS_STATE: seasonDetail.misc?.textMessages?.resultsState,
          },
          limit
        );
    }

    const where = createDefaultWhereForFlight({
      seasonDetail,
      flightStatus: undefined,
    });
    where.homeStateOfUser = RANKINGS.LUX;

    const resultQuery = await queryDb({ where, siteCountry: RANKINGS.LUX });

    const result = aggreateFlightsOverUser(resultQuery);
    limitFlightsForUserAndCalcTotals(result, NUMBER_OF_SCORED_FLIGHTS_LUX);
    sortDescendingByTotalPoints(result);

    return addConstantInformationToResult(
      result,
      {
        NUMBER_OF_SCORED_FLIGHTS_LUX,
        REMARKS_STATE: seasonDetail.misc?.textMessages?.resultsState,
      },
      limit
    );
  },

  getEarlyBird: async (year, siteRegion) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const startDate = seasonDetail.startDate;
    const endDate = moment(startDate).add(3, "months");
    const dates = { startDate, endDate };
    const where = createDefaultWhereForFlight({ seasonDetail: dates });
    const sortOrder = ["takeoffTime"];

    const resultQuery = await queryDb({ where, siteRegion, sortOrder });
    const result = resultQuery.map((r) => r.toJSON());
    const resultSingleUserEntries = removeMultipleEntriesForUsers(result);

    return addConstantInformationToResult(
      resultSingleUserEntries,
      {
        REMARKS: seasonDetail.misc?.textMessages?.resultsEarlybird,
      },
      20
    );
  },

  getLateBird: async (year, siteRegion) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const endDate = seasonDetail.endDate;
    const startDate = moment(endDate).subtract(2, "months");
    const dates = { startDate, endDate };
    const where = createDefaultWhereForFlight({ seasonDetail: dates });
    const sortOrder = [["landingTime", "DESC"]];

    const resultQuery = await queryDb({ where, siteRegion, sortOrder });
    const result = resultQuery.map((r) => r.toJSON());
    const resultSingleUserEntries = removeMultipleEntriesForUsers(result);

    return addConstantInformationToResult(
      resultSingleUserEntries,
      {
        REMARKS: seasonDetail.misc?.textMessages?.resultsLatebird,
      },
      20
    );
  },

  getNewcomer: async (year, siteRegion, limit) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    if (year < 2022) {
      checkIfRankingWasPresent(seasonDetail, RANKINGS.NEWCOMER);
      const oldResult = await findOldResult(year, RANKINGS.NEWCOMER);
      if (oldResult)
        return addConstantInformationToResult(
          oldResult,
          {
            NUMBER_OF_SCORED_FLIGHTS,
            REMARKS: seasonDetail.misc?.textMessages?.resultsNewcomer,
          },
          limit
        );
    }

    const where = createDefaultWhereForFlight({ seasonDetail });
    const rankingClass =
      seasonDetail.rankingClasses[NEWCOMER_MAX_RANKING_CLASS];
    const gliderClasses = rankingClass.gliderClasses ?? [];
    where.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };

    const resultQuery = await queryDb({ where, siteRegion });

    const resultAllUsers = aggreateFlightsOverUser(resultQuery);
    const resultsNewcomer = await removeNonNewcomer(resultAllUsers, year);

    limitFlightsForUserAndCalcTotals(resultsNewcomer, NUMBER_OF_SCORED_FLIGHTS);
    sortDescendingByTotalPoints(resultsNewcomer);

    return addConstantInformationToResult(
      resultsNewcomer,
      {
        NUMBER_OF_SCORED_FLIGHTS,
        NEWCOMER_MAX_RANKING_CLASS: rankingClass.description,
        REMARKS: seasonDetail.misc?.textMessages?.resultsNewcomer,
      },
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

async function findOldResult(season, type) {
  const result = await Result.findOne({
    where: {
      season,
      type,
    },
  });
  return result ? result.result : undefined;
}

function markFlightsToDismiss(team) {
  let allFlights = [];
  team.members.forEach((member) => {
    allFlights = allFlights.concat(member.flights);
  });
  allFlights.sort((a, b) => b.flightPoints - a.flightPoints);
  for (
    let i = TEAM_SIZE * NUMBER_OF_SCORED_FLIGHTS - TEAM_DISMISSES;
    i < allFlights.length;
    i++
  ) {
    team.members.forEach((member) => {
      const found = member.flights.find((f) => f.id == allFlights[i].id);
      if (found) {
        found.isDismissed = true;
      }
    });
  }
}

function calcTotalsOverMembers(team) {
  team.totalPoints = team.members.reduce(
    (acc, member) => acc + member.totalPoints,
    0
  );
  team.totalDistance = team.members.reduce(
    (acc, member) => acc + member.totalDistance,
    0
  );
}

function calcTotalsOfMember(member) {
  member.totalPoints = member.flights.reduce((acc, flight) => {
    if (flight.isDismissed) return acc;
    return acc + flight.flightPoints;
  }, 0);
  member.totalDistance = member.flights.reduce((acc, flight) => {
    if (flight.isDismissed) return acc;
    return acc + flight.flightDistance;
  }, 0);
}

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
        order: [["flightDistance", "DESC"]],
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

async function queryDb({
  where,
  gender,
  limit,
  site,
  siteId,
  club,
  clubId,
  useIncludes = ["user", "site", "club", "team"],
  siteRegion,
  siteState,
  siteCountry,
  sortOrder,
}) {
  const include = [];
  if (useIncludes.includes("user"))
    include.push(createIncludeStatementUser(gender));
  if (useIncludes.includes("site"))
    include.push(
      createIncludeStatementSite({
        site,
        siteId,
        region: siteRegion,
        state: siteState,
        country: siteCountry,
      })
    );
  if (useIncludes.includes("club"))
    include.push(cretaIncludeStatementClub(club, clubId));
  if (useIncludes.includes("team")) include.push(createIncludeStatementTeam());

  const queryObject = {
    where,
    include,
    attributes: [
      "id",
      "externalId",
      "flightPoints",
      "flightDistance",
      "takeoffTime",
      "glider",
      "flightType",
      "ageOfUser",
    ],
    order: [["flightPoints", "DESC"]],
  };
  if (limit) {
    queryObject.limit = limit;
  }
  if (sortOrder) {
    queryObject.order = sortOrder;
  }
  return Flight.findAll(queryObject);
}

function createIncludeStatementTeam() {
  return {
    model: Team,
    as: "team",
    attributes: ["name", "id"],
  };
}

function cretaIncludeStatementClub(club, clubId) {
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
  if (clubId) {
    clubInclude.where = {
      id: clubId,
    };
  }
  return clubInclude;
}

function createDefaultWhereForFlight({
  seasonDetail,
  isSenior,
  flightStatus = STATE.IN_RANKING,
} = {}) {
  const where = {
    takeoffTime: {
      [sequelize.Op.between]: [seasonDetail?.startDate, seasonDetail?.endDate],
    },
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

  if (flightStatus) {
    where.flightStatus = flightStatus;
  }

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
function createIncludeStatementSite({
  site,
  siteId,
  region,
  state,
  country,
} = {}) {
  const siteInclude = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["name", "shortName", "id"],
  };
  if (site) {
    siteInclude.where = {
      shortName: site,
    };
  }
  if (siteId) {
    siteInclude.where = {
      id: siteId,
    };
  }
  if (region || state || country) {
    const locationData = {};
    if (region) {
      locationData.region = region;
    }
    if (state) {
      locationData.state = state;
    }
    if (country) {
      locationData.country = country;
    }
    siteInclude.where = {
      locationData,
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
        totalDistance: memberEntry.totalDistance,
        totalPoints: memberEntry.totalPoints,
      });
    }
  });
  return result;
}

function aggreateFlightsOverUser(resultQuery) {
  const result = [];
  resultQuery.forEach((entry) => {
    const found = result.find((e) => e.user?.id == entry.user?.id);

    const flightEntry = {
      id: entry.id,
      externalId: entry.externalId,
      flightPoints: entry.flightPoints,
      flightDistance: Math.round(entry.flightDistance * 100) / 100,
      glider: entry.glider,
      flightType: entry.flightType,
      takeoffName: entry.takeoff?.name,
      takeoffShortName: entry.takeoff?.shortName,
      takeoffId: entry.takeoff?.id,
      takeoffRegion: entry.takeoff?.region,
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
          name: entry.club?.name, //A user must always belong to a club
          id: entry.club?.id,
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

function removeMultipleEntriesForUsers(resultsWithMultipleEntriesForUser) {
  const results = [];
  resultsWithMultipleEntriesForUser.forEach((e) => {
    const found = results.find((r) => r.user.id == e.user.id);
    if (found) return;
    results.push(e);
  });
  return results;
}

async function retrieveSeasonDetails(year) {
  const seasonDetail =
    year && year != getCurrentYear()
      ? await seasonService.getByYear(year)
      : await seasonService.getCurrentActive();
  return seasonDetail;
}

//TODO: Calc bonus in regards of seasonDetails for year xxxx
async function calcSeniorBonusForFlight(age) {
  const seasonDetail = await seasonService.getCurrentActive();
  const bonusPerYear = seasonDetail.seniorBonusPerAge;
  const startAge = seasonDetail.seniorStartAge;

  return age > startAge ? bonusPerYear * (age - startAge) : 0;
}

async function calcSeniorBonusForFlightResult(result) {
  await Promise.all(
    result.map(async (entry) => {
      let totalPoints = 0;
      await Promise.all(
        entry.flights.map(async (flight) => {
          flight.flightPoints = Math.round(
            (flight.flightPoints *
              (100 + (await calcSeniorBonusForFlight(flight.ageOfUser)))) /
              100
          );

          totalPoints += flight.flightPoints;
        })
      );
      entry.totalPoints = totalPoints;
    })
  );
}

/**
 * Checks if a ranking was present in the specific season. If not throws an error.
 * @param {*} seasonDetail The seasonDetails of the specific season
 * @param {*} rankingType The type of ranking (e.g. overall, senior, ladies) which will be checked
 * @throws An XccupRestrictionError if the rankingType was no active in the season
 */
function checkIfRankingWasPresent(seasonDetail, rankingType) {
  if (!seasonDetail.activeRankings?.includes(rankingType)) {
    throw new XccupHttpError(
      NOT_FOUND,
      `The ranking ${rankingType} was not present within the season ${seasonDetail.year}`
    );
  }
}

module.exports = service;
