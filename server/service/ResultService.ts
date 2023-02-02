import db from "../db";

import seasonService from "./SeasonService";
import teamService from "./TeamService";
import sequelize from "sequelize";

import { getCurrentYear } from "../helper/Utils";
import { FLIGHT_TYPE, FLIGHT_STATE } from "../constants/flight-constants";
import { GENDER } from "../constants/user-constants";
import {
  TEAM_DISMISSES,
  TEAM_SIZE,
  NUMBER_OF_SCORED_FLIGHTS,
  NEWCOMER_MAX_RANKING_CLASS,
} from "../config/result-determination-config";
import moment from "moment";
import { XccupHttpError } from "../helper/ErrorHandler";
import { NOT_FOUND } from "../constants/http-status-constants";
import { SeasonDetailAttributes } from "../db/models/SeasonDetail";

import type { RankingTypes } from "../db/models/SeasonDetail";
import type {
  UserResults,
  UserResultsWithTotals,
  ClubResults,
  UserResultFlight,
  QueryResult,
  SiteRecordsUncombined,
  FlightSitesWithRecord,
  FlightSiteRecord,
  Team,
  TeamWithMemberFlights,
} from "../types/ResultTypes";
import { FlightInstanceUserInclude } from "../db/models/Flight";
import {
  calcTotalsOfMember,
  calcTotalsOverMembers,
  limitFlightsForUserAndCalcTotals,
  removeMultipleEntriesForUsers,
  sortDescendingByTotalPoints,
} from "../helper/ResultUtils";

const { FlyingSite, User, Flight, Club, Team, Result } = db;

const cacheNonNewcomer: string[] = [];

const CURRENT_SCORING_VERSION_YEAR = 2023;

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

interface OptionsGetOverall extends OptionsYearLimitRegion {
  year: number;
  rankingClass: string;
  gender: string;
  homeStateOfUser: string;
  isSenior: boolean;
  isWeekend: boolean;
  isHikeAndFly: boolean;
  siteShortName: string;
  siteId: string;
  clubShortName: string;
  clubId: string;
  limit: number;
}
interface OptionsYearLimitRegion {
  year: number;
  limit: number;
  siteRegion: string;
}

const service = {
  getOverall: async ({
    year,
    rankingClass,
    gender,
    homeStateOfUser,
    isSenior,
    isWeekend,
    isHikeAndFly,
    siteShortName,
    siteId,
    siteRegion,
    clubShortName,
    clubId,
    limit,
  }: Partial<OptionsGetOverall>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = { NUMBER_OF_SCORED_FLIGHTS };

    // Search for old overall results
    const oldRes = await findOldResults(
      year,
      limit,
      "overall",
      seasonDetail,
      constantsForResult,
      nonShouldBeDefined(
        rankingClass,
        gender,
        homeStateOfUser,
        isSenior,
        isWeekend,
        isHikeAndFly,
        siteId,
        clubId
      )
    );
    if (oldRes) return oldRes;

    // Search for old overall ladies results
    if (gender == GENDER.FEMALE) {
      const oldRes = await findOldResults(
        year,
        limit,
        "ladies",
        seasonDetail,
        constantsForResult,
        nonShouldBeDefined(
          rankingClass ||
            homeStateOfUser ||
            isSenior ||
            isWeekend ||
            isHikeAndFly ||
            siteId ||
            clubId
        )
      );
      if (oldRes) return oldRes;
    }

    const where = createDefaultWhereForFlight({ seasonDetail, isSenior });
    if (rankingClass) {
      const gliderClasses =
        seasonDetail?.rankingClasses[rankingClass].gliderClasses ?? [];
      //@ts-ignore
      where.glider = {
        gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
      };
    }
    if (isWeekend) {
      //@ts-ignore
      where.isWeekend = true;
    }
    if (isHikeAndFly) {
      //@ts-ignore
      where.hikeAndFly = {
        [sequelize.Op.gt]: 0,
      };
    }
    if (homeStateOfUser) {
      //@ts-ignore
      where.homeStateOfUser = homeStateOfUser;
    }
    const resultQuery = (await queryDb({
      where,
      gender,
      siteShortName,
      siteId,
      siteRegion,
      clubShortName,
      clubId,
    })) as unknown as QueryResult[];

    const result = aggregateFlightsOverUser(resultQuery);
    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      result,
      NUMBER_OF_SCORED_FLIGHTS
    );
    sortDescendingByTotalPoints(resultsWithTotals);

    return addConstantInformationToResult(
      resultsWithTotals,
      { NUMBER_OF_SCORED_FLIGHTS },
      limit
    );
  },

  getClub: async ({ year, limit }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = { NUMBER_OF_SCORED_FLIGHTS };

    const oldRes = await findOldResults(
      year,
      limit,
      "club",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const where = createDefaultWhereForFlight({ seasonDetail });
    const resultQuery = (await queryDb({ where })) as unknown as QueryResult[];

    const resultOverUser = aggregateFlightsOverUser(resultQuery);
    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      resultOverUser,
      NUMBER_OF_SCORED_FLIGHTS
    );
    const resultOverClub = aggregateOverClubAndCalcTotals(resultsWithTotals);

    resultOverClub.forEach((club) => {
      // Sort also members in club by totalPoints
      sortDescendingByTotalPoints(club.members);
    });
    sortDescendingByTotalPoints(resultOverClub);

    return addConstantInformationToResult(
      resultOverClub,
      constantsForResult,
      limit
    );
  },

  getTeam: async ({
    year,
    limit,
    siteRegion,
  }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = {
      NUMBER_OF_SCORED_FLIGHTS,
      TEAM_DISMISSES,
      TEAM_SIZE,
      REMARKS: seasonDetail?.misc?.textMessages?.resultsTeam,
    };

    const oldRes = await findOldResults(
      year,
      limit,
      "team",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const teamsOfSeason = (await teamService.getAll({
      year,
    })) as Team[];

    const teamResults = await Promise.all(
      teamsOfSeason.map(async (team) => {
        attachFlightsToTeamMembers;
        const membersWithFlights = await attachFlightsToTeamMembers(
          team,
          seasonDetail,
          siteRegion
        );
        const teamWithFlights = {
          ...team,
          members: membersWithFlights,
        } as unknown as TeamWithMemberFlights;

        markFlightsToDismiss(teamWithFlights);

        teamWithFlights.members.forEach((member) => {
          calcTotalsOfMember(member);
        });
        const teamWithTotals = calcTotalsOverMembers(teamWithFlights);
        sortDescendingByTotalPoints(teamWithTotals.members);

        return teamWithTotals;
      })
    );

    sortDescendingByTotalPoints(teamResults);

    return addConstantInformationToResult(
      teamResults,
      constantsForResult,
      limit
    );
  },

  getSenior: async ({
    year,
    limit,
    siteRegion,
  }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = {
      NUMBER_OF_SCORED_FLIGHTS,
      SENIOR_START_AGE: seasonDetail?.seniorStartAge,
      SENIOR_BONUS_PER_AGE: seasonDetail?.seniorBonusPerAge,
      REMARKS: seasonDetail?.misc?.textMessages?.resultsSeniors,
    };

    const oldRes = await findOldResults(
      year,
      limit,
      "seniors",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const where = createDefaultWhereForFlight({ seasonDetail, isSenior: true });
    const resultQuery = (await queryDb({
      where,
      siteRegion,
    })) as unknown as QueryResult[];

    const result = aggregateFlightsOverUser(resultQuery);
    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      result,
      NUMBER_OF_SCORED_FLIGHTS
    );
    await addSeniorBonusForFlightResult(resultsWithTotals);
    sortDescendingByTotalPoints(resultsWithTotals);

    return addConstantInformationToResult(result, constantsForResult, limit);
  },

  /**
   * Calculate the results for rlp cup.
   *
   * @param {*} year The year to calculate the ranking for
   * @param {*} limit The limit of results to retrieve
   * @returns The results of the ranking  of the provided year
   */
  getRhineland: async ({ year, limit }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = {
      NUMBER_OF_SCORED_FLIGHTS,
      REMARKS_STATE: seasonDetail?.misc?.textMessages?.resultsState,
    };

    const oldRes = await findOldResults(
      year,
      limit,
      "RP",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const where = createDefaultWhereForFlight({ seasonDetail });
    //@ts-ignore
    where.homeStateOfUser = RANKINGS.RP;

    const resultQuery = (await queryDb({
      where,
      siteState: RANKINGS.RP,
    })) as unknown as QueryResult[];

    const result = aggregateFlightsOverUser(resultQuery);
    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      result,
      NUMBER_OF_SCORED_FLIGHTS
    );
    sortDescendingByTotalPoints(resultsWithTotals);

    return addConstantInformationToResult(result, constantsForResult, limit);
  },

  /**
   * Calculate the results for luxembourg ranking.
   *
   * @param {*} year The year to calculate the ranking for
   * @param {*} limit The limit of results to retrieve
   * @returns The results of the ranking of the provided year
   */
  getLuxembourg: async ({ year, limit }: Partial<OptionsYearLimitRegion>) => {
    const NUMBER_OF_SCORED_FLIGHTS_LUX = 6;

    const seasonDetail = await retrieveSeasonDetails(year);

    const constantsForResult = {
      NUMBER_OF_SCORED_FLIGHTS: NUMBER_OF_SCORED_FLIGHTS_LUX,
      REMARKS_STATE: seasonDetail?.misc?.textMessages?.resultsState,
    };

    const oldRes = await findOldResults(
      year,
      limit,
      "LUX",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const where = createDefaultWhereForFlight({
      seasonDetail,
      flightStatuses: [FLIGHT_STATE.IN_RANKING, FLIGHT_STATE.NOT_IN_RANKING],
    });
    //@ts-ignore
    where.homeStateOfUser = RANKINGS.LUX;

    const resultQuery = (await queryDb({
      where,
      siteCountry: RANKINGS.LUX,
    })) as unknown as QueryResult[];

    const result = aggregateFlightsOverUser(resultQuery);
    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      result,
      NUMBER_OF_SCORED_FLIGHTS_LUX,
      true
    );
    sortDescendingByTotalPoints(resultsWithTotals);

    return addConstantInformationToResult(result, constantsForResult, limit);
  },

  getEarlyBird: async ({
    year,
    siteRegion,
  }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const startDate = seasonDetail?.startDate;
    const endDate = moment(startDate).add(3, "months").toDate();
    const dates = { startDate, endDate };
    const where = createDefaultWhereForFlight({ seasonDetail: dates });
    const sortOrder = ["takeoffTime"];

    const resultQuery = await queryDb({ where, siteRegion, sortOrder });
    const result = resultQuery.map((r) =>
      r.toJSON()
    ) as unknown as FlightInstanceUserInclude[];
    const resultSingleUserEntries = removeMultipleEntriesForUsers(result);

    return addConstantInformationToResult(
      resultSingleUserEntries,
      {
        REMARKS: seasonDetail?.misc?.textMessages?.resultsEarlybird,
      },
      20
    );
  },

  getLateBird: async ({
    year,
    siteRegion,
  }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const endDate = seasonDetail?.endDate;
    const startDate = moment(endDate).subtract(2, "months").toDate();
    const dates = { startDate, endDate };
    const where = createDefaultWhereForFlight({ seasonDetail: dates });
    const sortOrder = [["landingTime", "DESC"]];

    const resultQuery = await queryDb({ where, siteRegion, sortOrder });
    const result = resultQuery.map((r) =>
      r.toJSON()
    ) as unknown as FlightInstanceUserInclude[];
    const resultSingleUserEntries = removeMultipleEntriesForUsers(result);

    return addConstantInformationToResult(
      resultSingleUserEntries,
      {
        REMARKS: seasonDetail?.misc?.textMessages?.resultsLatebird,
      },
      20
    );
  },

  getNewcomer: async ({
    year,
    limit,
    siteRegion,
  }: Partial<OptionsYearLimitRegion>) => {
    const seasonDetail = await retrieveSeasonDetails(year);

    const rankingClass =
      seasonDetail?.rankingClasses[NEWCOMER_MAX_RANKING_CLASS];
    const gliderClasses = rankingClass.gliderClasses ?? [];

    const constantsForResult = {
      NUMBER_OF_SCORED_FLIGHTS,
      NEWCOMER_MAX_RANKING_CLASS: rankingClass.description,
      REMARKS: seasonDetail?.misc?.textMessages?.resultsNewcomer,
    };

    const oldRes = await findOldResults(
      year,
      limit,
      "newcomer",
      seasonDetail,
      constantsForResult
    );
    if (oldRes) return oldRes;

    const where = createDefaultWhereForFlight({ seasonDetail });
    //@ts-ignore
    where.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };

    const resultQuery = (await queryDb({
      where,
      siteRegion,
    })) as unknown as QueryResult[];

    const resultAllUsers = aggregateFlightsOverUser(resultQuery);
    const resultsNewcomer = await removeNonNewcomer(resultAllUsers, year);

    const resultsWithTotals = limitFlightsForUserAndCalcTotals(
      resultsNewcomer,
      NUMBER_OF_SCORED_FLIGHTS
    );
    sortDescendingByTotalPoints(resultsWithTotals);

    return addConstantInformationToResult(
      resultsWithTotals,
      constantsForResult,
      limit
    );
  },

  getSiteRecords: async () => {
    const freeRecords = findSiteRecordOfType(FLIGHT_TYPE.FREE);
    const flatRecords = findSiteRecordOfType(FLIGHT_TYPE.FLAT);
    const faiRecords = findSiteRecordOfType(FLIGHT_TYPE.FAI);

    const [free, flat, fai] = await Promise.all([
      freeRecords,
      flatRecords,
      faiRecords,
    ]);

    return mergeRecordsByTakeoffs({ free, flat, fai });
  },
};

function markFlightsToDismiss(team: TeamWithMemberFlights) {
  let allFlights: UserResultFlight[] = [];

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

function addConstantInformationToResult(
  result: any[],
  constants?: { [key: string]: any },
  limit?: number
) {
  return {
    constants,
    values: limit ? result.slice(0, limit) : result,
  };
}

async function removeNonNewcomer(resultAllUsers: UserResults[], year?: number) {
  const resultsNewcomer: UserResults[] = [];

  const searchYear = year ? year : getCurrentYear();

  await Promise.all(
    resultAllUsers.map(async (flightsOfUser) => {
      if (cacheNonNewcomer.includes(flightsOfUser.user.id)) return;

      const numberOfFlightsInPreviousSeasons = (await Flight.count({
        where: {
          flightStatus: FLIGHT_STATE.IN_RANKING,
          // @ts-ignore
          userId: flightsOfUser.user.id,
          andOp: sequelize.where(
            sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
            {
              [sequelize.Op.lt]: searchYear,
            }
          ),
        },
      })) as unknown as number;

      numberOfFlightsInPreviousSeasons > 0
        ? cacheNonNewcomer.push(flightsOfUser.user.id)
        : resultsNewcomer.push(flightsOfUser);
    })
  );

  return resultsNewcomer;
}

async function mergeRecordsByTakeoffs(records: SiteRecordsUncombined) {
  const results = [];

  for (let index = 0; index < records.free.length; index++) {
    const combinedResult = {
      takeoff: {
        id: records.free[index].id,
        name: records.free[index].name,
        shortName: records.free[index].shortName,
      },
      free: createEntryOfRecord(records.free[index].flights[0]),
      flat: createEntryOfRecord(records.flat[index].flights[0]),
      fai: createEntryOfRecord(records.fai[index].flights[0]),
    };
    results.push(combinedResult);
  }

  return results;
}

function createEntryOfRecord(siteRecord: FlightSiteRecord) {
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

async function attachFlightsToTeamMembers(
  team: Team,
  seasonDetail: SeasonDetailAttributes,
  siteRegion?: string
) {
  return await Promise.all(
    team.members.map(async (member) => {
      const where = createDefaultWhereForFlight({ seasonDetail });
      //@ts-ignore
      where.userId = member.id;
      const flights = (
        await queryDb({
          where,
          limit: NUMBER_OF_SCORED_FLIGHTS,
          siteRegion,
          useIncludes: ["site"],
        })
      ).map((e) => e.toJSON());
      return { ...member, flights };
    })
  );
}

async function findSiteRecordOfType(type: string) {
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
          [sequelize.Op.or]: [
            { violationAccepted: true },
            {
              [sequelize.Op.and]: [
                { uncheckedGRecord: false },
                { airspaceViolation: false },
              ],
            },
          ],
        },
        order: [["flightDistance", "DESC"]],
        limit: 1,
        include: {
          // @ts-ignore
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "fullName", "id"],
        },
      },
    ],
    attributes: ["id", "name", "shortName"],
    // @ts-ignore
    order: [["name"]],
  }) as Promise<FlightSitesWithRecord[]>;
}

interface queryDbOptions {
  where: Object;
  gender: string;
  limit: number;
  siteShortName: string;
  siteId: string;
  clubShortName: string;
  clubId: string;
  useIncludes: string[];
  siteRegion: string;
  siteState: string;
  siteCountry: string;
  sortOrder: string[] | string[][];
}
async function queryDb({
  where,
  gender,
  limit,
  siteShortName,
  siteId,
  clubShortName,
  clubId,
  useIncludes = ["user", "site", "club", "team"],
  siteRegion,
  siteState,
  siteCountry,
  sortOrder,
}: Partial<queryDbOptions>) {
  const include = [];
  if (useIncludes.includes("user"))
    include.push(createIncludeStatementUser(gender));
  if (useIncludes.includes("site"))
    include.push(
      createIncludeStatementSite({
        siteShortName,
        siteId,
        region: siteRegion,
        state: siteState,
        country: siteCountry,
      })
    );
  if (useIncludes.includes("club"))
    include.push(createIncludeStatementClub(clubShortName, clubId));
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
    // @ts-ignore
    queryObject.limit = limit;
  }
  if (sortOrder) {
    // @ts-ignore
    queryObject.order = sortOrder;
  }
  // @ts-ignore
  return Flight.findAll(queryObject);
}

function createIncludeStatementTeam() {
  return {
    model: Team,
    as: "team",
    attributes: ["name", "id"],
  };
}

function createIncludeStatementClub(shortName?: string, id?: string) {
  const clubInclude = {
    model: Club,
    as: "club",
    attributes: ["name", "shortName", "id"],
    where: {},
  };
  if (shortName) {
    clubInclude.where = {
      shortName,
    };
  }
  if (id) {
    clubInclude.where = {
      id,
    };
  }
  return clubInclude;
}

type Values<T> = T[keyof T];

interface optionsCreateDefaultWhere {
  seasonDetail: Partial<SeasonDetailAttributes>;
  isSenior: boolean;
  flightStatuses: Values<typeof FLIGHT_STATE>[];
}

function createDefaultWhereForFlight({
  seasonDetail,
  isSenior,
  flightStatuses = [FLIGHT_STATE.IN_RANKING],
}: Partial<optionsCreateDefaultWhere> = {}) {
  const where = {
    takeoffTime: {
      [sequelize.Op.between]: [seasonDetail?.startDate, seasonDetail?.endDate],
    },
    flightStatus: {
      [sequelize.Op.in]: flightStatuses,
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

  if (isSenior) {
    // @ts-ignore
    where.ageOfUser = {
      [sequelize.Op.gte]: seasonDetail?.seniorStartAge,
    };
  }

  return where;
}

function createIncludeStatementUser(gender?: string) {
  const userInclude = {
    model: User,
    as: "user",
    attributes: [
      "firstName",
      "lastName",
      "fullName",
      "id",
      "gender",
      "birthday",
    ],
    where: {},
  };
  if (gender) {
    userInclude.where = {
      gender: gender ? gender.toUpperCase() : Object.values(GENDER),
    };
  }
  return userInclude;
}

interface optionsCreateIncludeSite {
  siteShortName: string;
  siteId: string;
  region: string;
  state: string;
  country: string;
}
function createIncludeStatementSite({
  siteShortName,
  siteId,
  region,
  state,
  country,
}: Partial<optionsCreateIncludeSite> = {}) {
  const siteInclude = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["name", "shortName", "id"],
    where: {},
  };
  if (siteShortName) {
    siteInclude.where = {
      shortName: siteShortName,
    };
  }
  if (siteId) {
    siteInclude.where = {
      id: siteId,
    };
  }
  if (region || state || country) {
    const locationData: { region?: string; state?: string; country?: string } =
      {};
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

function aggregateOverClubAndCalcTotals(
  resultOverUser: UserResultsWithTotals[]
) {
  const result: ClubResults[] = [];

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

function aggregateFlightsOverUser(resultQuery: QueryResult[]) {
  const result: UserResults[] = [];

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

async function retrieveSeasonDetails(year?: number) {
  const seasonDetail =
    year && year != getCurrentYear()
      ? await seasonService.getByYear(year)
      : await seasonService.getCurrentActive();
  return seasonDetail;
}

//TODO: Calc bonus in regards of seasonDetails for year xxxx
async function calcSeniorBonusForFlight(age: number) {
  const seasonDetail = await seasonService.getCurrentActive();
  const bonusPerYear = seasonDetail?.seniorBonusPerAge;
  const startAge = seasonDetail?.seniorStartAge;

  return age > startAge ? bonusPerYear * (age - startAge) : 0;
}

async function addSeniorBonusForFlightResult(result: UserResultsWithTotals[]) {
  await Promise.all(
    result.map(async (entry) => {
      let totalPoints = 0;
      await Promise.all(
        entry.flights.map(async (flight: UserResultFlight) => {
          flight.flightPoints = Math.round(
            (flight.flightPoints
              ? flight.flightPoints *
                (100 + (await calcSeniorBonusForFlight(flight.ageOfUser)))
              : 0) / 100
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
function checkIfRankingWasPresent(
  seasonDetail: SeasonDetailAttributes,
  rankingType: RankingTypes
) {
  if (!seasonDetail?.activeRankings?.includes(rankingType)) {
    throw new XccupHttpError(
      NOT_FOUND,
      `The ranking ${rankingType} was not present within the season ${seasonDetail?.year}`
    );
  }
}

/**
 * Checks if a result for the presented year and rankingType is stored in the db.
 * If found returns the result otherwise undefined.
 *
 * This is important because the scoring algorithm could change over time and would manipulated old results.
 */
async function findOldResults(
  year?: number,
  limit?: number,
  rankingType?: RankingTypes,
  seasonDetail?: SeasonDetailAttributes,
  constantsForResult?: { [key: string]: any },
  skipSearch?: boolean
) {
  if (!year || !rankingType || !seasonDetail || skipSearch) return undefined;

  if (year < CURRENT_SCORING_VERSION_YEAR) {
    checkIfRankingWasPresent(seasonDetail, rankingType);
    const oldResult = await findOldResult(year, rankingType);
    if (oldResult)
      return addConstantInformationToResult(
        oldResult,
        constantsForResult,
        limit
      );
  }
}

async function findOldResult(season: number, type: string) {
  const result = await Result.findOne({
    where: {
      season,
      type,
    },
  });
  return result ? result.result : undefined;
}

function nonShouldBeDefined(...params: any[]) {
  return params.every((p) => !p);
}

module.exports = service;
export default service;
