import sequelize from "sequelize";
import db from "../db";
import mailService from "./MailService";
import moment from "moment";
import { startCalculation, OLCResult } from "../igc/IgcAnalyzer";
import { findLanding } from "../igc/LocationFinder";
import { calculateFlightStats } from "../igc/FlightStatsCalculator";
import { getCurrentActive } from "./SeasonService";
import { findClosestTakeoff } from "./FlyingSiteService";
import { hasAirspaceViolation } from "./AirspaceService";
import MailService from "./MailService";
import { isNoWorkday } from "../helper/HolidayCalculator";
import { sleep, findKeyByValue } from "../helper/Utils";
import { deleteIgcFile } from "../helper/igc-file-utils";
import { COUNTRY, STATE as USER_STATE } from "../constants/user-constants";
import { STATE } from "../constants/flight-constants";
import logger from "../config/logger";
import config from "../config/env-config";
import { deleteCache } from "../controller/CacheManager";
import {
  createGeometry,
  extractTimeAndHeights,
  combineFixesProperties,
} from "../helper/FlightFixUtils";
import { checkSiteRecordsAndUpdate } from "./SiteRecordCache";
import {
  getElevationData,
  addElevationToFixes,
  logElevationError,
} from "../igc/ElevationHelper";

import { checkIfFlightIsNewPersonalBest } from "../helper/PersonalBest";
import {
  FlightAttributes,
  FlightInstance,
  FlightInstanceUserInclude,
} from "../db/models/Flight";
import { Glider } from "../db/models/Flight";
import { FlightFixCombined, FlightFixStat } from "../types/FlightFixes";
import { Fn } from "sequelize/types/utils";
import { FlightCommentInstance } from "../db/models/FlightComment";
import { FlightPhotoInstance } from "../db/models/FlightPhoto";

interface WhereOptions {
  year?: number;
  site?: string;
  siteId?: string;
  flightType?: string;
  rankingClass?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  gliderClass?: string;
  flightStatus?: string;
  onlyUnchecked?: boolean;
  includeUnchecked?: boolean;
  limit?: number;
  offset?: number;
  clubId?: string;
  teamId?: string;
  status?: string;
  sort?: [string?, string?];
  minimumData?: boolean;
  isAdminRequest?: boolean;
}

interface FinalizeFlightSubmission {
  flight?: FlightInstance;
  report?: string;
  airspaceComment?: string;
  onlyLogbook?: boolean;
  glider?: Glider;
  hikeAndFly?: boolean;
}

interface CreateFlight {
  userId: string;
  igcPath: string;
  externalId: number;
  uploadEndpoint: string;
  validationResult: string;
}

interface CreateFlightObject extends Omit<CreateFlight, "validationResult"> {
  teamId?: string;
  clubId?: string;
  homeStateOfUser?: string;
  uncheckedGRecord?: boolean;
  flightStatus: string;
}

type FlightApiResponse = Omit<FlightAttributes, "fixes"> & {
  fixes: FlightFixCombined[];
  comments?: FlightCommentInstance[];
  photos?: FlightPhotoInstance[];
};

const flightService = {
  getAll: async ({
    year,
    site,
    siteId,
    flightType,
    rankingClass,
    limit,
    offset,
    startDate,
    endDate,
    userId,
    clubId,
    teamId,
    gliderClass,
    status,
    onlyUnchecked,
    includeUnchecked,
    sort,
    minimumData,
    isAdminRequest,
  }: WhereOptions = {}) => {
    const orderStatement = createOrderStatement(sort);

    const queryObject = {
      include: [
        createUserInclude(isAdminRequest),
        createSiteInclude(site, siteId),
        createTeamInclude(teamId),
        createClubInclude(clubId),

        // The includes for photos and comments are only present to count the related objects
        {
          model: db.FlightPhoto,
          as: "photos",
          attributes: ["id"],
        },
        {
          model: db.FlightComment,
          as: "comments",
          attributes: ["id"],
        },
      ],
      where: await createWhereStatement({
        year,
        flightType,
        rankingClass,
        startDate,
        endDate,
        userId,
        gliderClass,
        flightStatus: status,
        onlyUnchecked,
        includeUnchecked,
      }),
      order: orderStatement,
    };

    if (limit) {
      // @ts-ignore If someone wants to type this, feel free
      queryObject.limit = limit;
    }

    if (offset) {
      // @ts-ignore If someone wants to type this, feel free
      queryObject.offset = offset;
    }

    if (minimumData) {
      // @ts-ignore If someone wants to type this, feel free

      queryObject.attributes = [
        "id",
        "externalId",
        "takeoffTime",
        "flightPoints",
        "flightDistance",
        "flightType",
      ];
    }

    /**
     * distinct=true was necessary after photos and comments where included
     * https://github.com/sequelize/sequelize/issues/9481
     * */
    // @ts-ignore If someone wants to type this, feel free
    queryObject.distinct = true;

    const flights = await db.Flight.findAndCountAll(queryObject);

    /**
     * Without mapping "FATAL ERROR: v8::Object::SetInternalField() Internal field out of bounds" occurs.
     * This is due to the fact that node-cache can't clone sequelize objects with active tcp handles.
     * See also: https://github.com/pvorb/clone/issues/106
     */
    const resObj = {
      rows: flights.rows.map((v) =>
        v.toJSON()
      ) as unknown as FlightApiResponse[],
      count: flights.count,
    };

    countRelatedObjects(resObj.rows, "photos");
    countRelatedObjects(resObj.rows, "comments");

    return resObj;
  },

  getTodays: async () => {
    const SWITCHOVER_HOUR_TODAY_RANKING = 15;

    const today = new Date();
    let fromDay = today.getDate() - 1;
    let tillDay = today.getDate();

    if (today.getHours() >= SWITCHOVER_HOUR_TODAY_RANKING) {
      fromDay++;
      tillDay++;
    }
    const startDate = new Date(today.getFullYear(), today.getMonth(), fromDay);
    const endDate = new Date(today.getFullYear(), today.getMonth(), tillDay);

    const queryObject = {
      include: [
        createUserInclude(),
        createFixesInclude(["geom"]),
        createSiteInclude(),
      ],
      where: await createWhereStatement({ startDate, endDate }),
      order: [["flightPoints", "DESC"]],
      raw: true,
      nest: true,
    };

    // @ts-ignore If someone wants to type this, feel free
    const flights = await db.Flight.findAll(queryObject);

    return stripFlightFixesForTodayRanking(flights);
  },

  getById: async (id: string, noIncludes: boolean) => {
    const includes = [
      createSiteInclude(),
      createFixesInclude(["geom", "timeAndHeights"]),
    ];
    return await db.Flight.findOne({
      where: { id },
      include: noIncludes ? [] : includes,
    });
  },

  getByExternalId: async (
    externalId: number,
    { excludeSecrets }: { excludeSecrets?: boolean } = {}
  ) => {
    const blackListedDataAttributes = [
      "airspaceViolations",
      "airspaceViolation",
      "violationAccepted",
    ];
    const exclude = excludeSecrets ? blackListedDataAttributes : null;

    const flightDbObject = await db.Flight.findOne({
      where: { externalId },
      include: [
        createFixesInclude(["geom", "timeAndHeights", "stats"]),
        createUserInclude(),
        createSiteInclude(),
        createClubInclude(),
        createTeamInclude(),
        {
          model: db.FlightComment,
          as: "comments",
          include: [createUserInclude()],
        },
        {
          model: db.FlightPhoto,
          as: "photos",
        },
      ],
      // @ts-ignore If someone wants to type this, feel free
      attributes: { exclude },
      order: [
        [{ model: db.FlightComment, as: "comments" }, "createdAt", "ASC"],
        [{ model: db.FlightPhoto, as: "photos" }, "createdAt", "ASC"],
      ],
    });
    if (flightDbObject) {
      const flight = flightDbObject.toJSON();
      if (!flight.fixes) return;
      //TODO: Merge directly when model is retrieved?

      // TODO: TS: Is there a more elegant way?
      const resObj = flight as unknown as FlightApiResponse;
      resObj.fixes = combineFixesProperties(flight.fixes);

      // Even though we have now a better airbuddy algo this is still here to support older flights with airbuddies
      if (!flight.airbuddies)
        resObj.airbuddies = await findAirbuddiesLegacy(flight);

      return resObj;
    }
    return null;
  },

  sumDistance: async (year: number) => {
    const totalDistance = await db.Flight.sum("flightDistance", {
      where: {
        // @ts-ignore
        andOp: sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
          year
        ),
      },
    });
    return Math.round(totalDistance);
  },

  sumFlightColumnByUser: async (columnName: string, userId: string) => {
    // @ts-ignore
    const sum = await db.Flight.sum(columnName, {
      where: {
        userId,
      },
    });
    return Math.round(sum);
  },

  countFlightsByUser: async (userId: string) => {
    return db.Flight.count({
      where: {
        // @ts-ignore
        userId,
        [sequelize.Op.not]: { flightStatus: STATE.IN_PROCESS },
        [sequelize.Op.or]: [
          { violationAccepted: true },
          {
            airspaceViolation: false,
            uncheckedGRecord: false,
          },
        ],
      },
    });
  },

  getAllBrands: async () => {
    const brands = await db.Brand.findAll({ order: [["name", "ASC"]] });
    return brands.map((e) => e.name);
  },

  update: async (flight: FlightInstance) => {
    return flight.save();
  },

  acceptViolation: async (flight: FlightInstance) => {
    if (!flight.takeoffTime || !flight.flightPoints) return;
    flight.violationAccepted = true;
    flight.flightStatus = await calcFlightStatus(
      flight.takeoffTime,
      flight.flightPoints,
      flight.flightStatus == STATE.FLIGHTBOOK
    );

    const result = await flight.save();
    MailService.sendAirspaceViolationAcceptedMail(flight);
    return result;
  },

  rejectViolation: async (flight: FlightInstance, message: string) => {
    MailService.sendAirspaceViolationRejectedMail(flight, message);
    flightService.delete(flight);
  },

  /**
   * Updates one or several properties of a flight model.
   *
   * @param {*} id The ID of the flight to update
   * @param {*} props The properties of the flight model which should be updated
   * @return 1 if an entry was updated; 0 when no entry was updated
   */
  changeFlightProps: async (id: string, props = {}) => {
    return (await db.Flight.update(props, { where: { id } }))[0];
  },

  finalizeFlightSubmission: async ({
    flight,
    report,
    airspaceComment,
    onlyLogbook,
    glider,
    hikeAndFly,
  }: FinalizeFlightSubmission = {}) => {
    if (!flight) return;
    // Set report when value is defined or empty
    if (report || report == "") flight.report = report;

    if (airspaceComment || airspaceComment == "") {
      flight.airspaceComment = airspaceComment;
    }

    if (hikeAndFly) {
      const site = await db.FlyingSite.findByPk(flight.siteId, {
        attributes: ["heightDifference"],
      });
      flight.hikeAndFly = site?.heightDifference;
    }
    if (!hikeAndFly) flight.hikeAndFly = 0;

    const isNewFlightUpload = flight.flightStatus === STATE.IN_PROCESS;

    if (glider) {
      await createGliderObject(flight, glider);

      const flightPoints = await calcFlightPoints(flight, glider);
      flight.flightPoints = flightPoints;

      if (flight.flightStatus != STATE.IN_REVIEW && flight.takeoffTime) {
        const flightStatus = await calcFlightStatus(
          flight.takeoffTime,
          flightPoints,
          onlyLogbook
        );
        flight.flightStatus = flightStatus;
      }
    }

    if (flight.airspaceViolation) MailService.sendNewAdminTask();

    // Check if flight is a new personal best (not on edit)
    if (isNewFlightUpload && !flight.isNewPersonalBest && flight.glider) {
      logger.info("FS: Will check if flight is new personal best");
      const isNewPersonalBest = await checkIfFlightIsNewPersonalBest(flight);

      if (isNewPersonalBest) {
        logger.info("FS: Flight is new personal best");
        flight.isNewPersonalBest = true;
        // TODO: Do not send if there is an airspace violation?
        mailService.sendNewPersonalBestMail(flight);
      }
    }

    const updatedColumns = await flight.save();
    checkSiteRecordsAndUpdate(flight);
    return updatedColumns;
  },

  delete: async (flight: FlightInstance) => {
    deleteIgcFile(flight.igcPath);
    return db.Flight.destroy({ where: { id: flight.id } });
  },

  addResult: async (result: OLCResult) => {
    logger.info("FS: Will add igc result to flight " + result.id);
    const flight = await flightService.getById(result.id, true);

    if (!flight) {
      // This can occur if a user uploads the same igc file again before the calculation has finished.
      logger.warn(
        `FS: Could not add result to flight ${result.id} because the flight wasn't found`
      );
      return;
    }
    const isNewFlightUpload = flight.flightStatus === STATE.IN_PROCESS;

    flight.flightDistance = +result.dist;
    flight.flightType = result.type;
    flight.flightTurnpoints = result.turnpoints;
    calculateTaskSpeed(result, flight);

    if (flight.glider) {
      // If true, the calculation took so long that the glider was already submitted by the user.
      // Therefore calculation of points and status can and will be started here.
      const flightPoints = await calcFlightPoints(flight, flight.glider);
      flight.flightPoints = flightPoints;

      if (flight.flightStatus != STATE.IN_REVIEW && flight.takeoffTime) {
        const flightStatus = await calcFlightStatus(
          flight.takeoffTime,
          flight.flightPoints
        );
        flight.flightStatus = flightStatus;
      }
    }
    // Check if flight is a new personal best (not on edit)
    if (isNewFlightUpload && !flight.isNewPersonalBest && flight.glider) {
      logger.info("FS: Will check if flight is new personal best");
      const isNewPersonalBest = await checkIfFlightIsNewPersonalBest(flight);

      if (isNewPersonalBest) {
        logger.info("FS: Flight is new personal best");
        flight.isNewPersonalBest = true;
        // TODO: Do not send if there is an airspace violation?
        mailService.sendNewPersonalBestMail(flight);
      }
    }
    await flight.save();

    // TODO: Why does this run twice? Here and in finalizeFlightSubmission
    checkSiteRecordsAndUpdate(flight);
    deleteCache(["home", "flights", "results"]);
  },

  attachElevationDataAndCheckForAirspaceViolations: async (
    flight: FlightInstance
  ) => {
    // Get elevation data and add it to flight fixes
    const flightFixesRef = await retrieveDbObjectOfFlightFixes(flight.id);
    if (!flightFixesRef) return;
    const combinedFixes = combineFixesProperties(flightFixesRef);

    try {
      const elevations = await getElevationData(combinedFixes);
      addElevationToFixes(flightFixesRef.timeAndHeights, elevations);

      // It's necessary to explicit call "changed", because a call to "save" will
      // only updated data when a value has changed. Unfortunately the addition of elevation
      // data inside the data object doesn't trigger any change event.
      flightFixesRef.changed("timeAndHeights", true);
      await flightFixesRef.save();
    } catch (error) {
      logElevationError(error);
      MailService.sendGoogleElevationErrorAdminMail(flight.externalId, error);
    }

    /**
     * Before evaluating airspace violation it's necessary to determine the elevation data.
     * Because some airspace boundaries are defined in relation to the surface (e.g. Floor 1500FT AGL)
     */
    const violationResult = await hasAirspaceViolation(flightFixesRef);
    if (violationResult) {
      flight.airspaceViolation = true;
      flight.violationAccepted = false;
      flight.flightStatus = STATE.IN_REVIEW;
      flight.airspaceViolations = violationResult.airspaceViolations;
      flight.save();
    }

    return violationResult;
  },

  create: async ({
    userId,
    igcPath,
    externalId,
    uploadEndpoint,
    validationResult,
  }: CreateFlight) => {
    const flight: CreateFlightObject = {
      userId,
      igcPath,
      externalId,
      uploadEndpoint,
      uncheckedGRecord: validationResult == undefined ? true : false,
      flightStatus: STATE.IN_PROCESS,
    };

    await attachUserData(flight);
    // @ts-ignore
    return db.Flight.create(flight);
  },

  startResultCalculation: async (flight: FlightInstance) => {
    const flightTypeFactors = (await getCurrentActive()).flightTypeFactors;

    startCalculation(flight, flightTypeFactors, (result: OLCResult) => {
      flightService.addResult(result);
    }).catch((error) => logger.error(error));
  },

  /**
   * Attaches fix related data like takeoffTime, airtime to the flight object from the db.
   * It's necessary to call the save method of the object to persist the data.
   *
   * @param {Object} flight The db object of the flight.
   * @param {Array} fixes An array of fixes of the related flight.
   */
  attachFixRelatedTimeDataToFlight: (
    flight: FlightInstance,
    fixes: FlightFixCombined[]
  ) => {
    flight.airtime = calcAirtime(fixes);
    flight.takeoffTime = new Date(fixes[0].timestamp);
    flight.landingTime = new Date(fixes[fixes.length - 1].timestamp);
    flight.isWeekend = isNoWorkday(flight.takeoffTime);
  },

  /**
   * Starts the calculation of the flight stats and attaches the results to the flight object .
   * It's necessary to call the save method of the flight object to persist the data.
   * The save method will not be called in this method to prevent multiple updates to the same flight in the database.
   *
   * @param {Object} flight The db object of the flight
   * @param {Array} fixes An array of fixes of the related flight
   */
  storeFixesAndAddStats: async (
    flight: FlightInstance,
    fixes: FlightFixCombined[]
  ) => {
    const fixesStats = attachFlightStats(flight, fixes);
    return storeFixesToDB(flight, fixes, fixesStats);
  },

  /**
   * Searches for takeoff and landing and attaches them to the flight.
   * It's necessary to call the save method of the flight object to persist the data.
   * The save method will not be called in this method to prevent multiple updates to the same flight in the database.
   *
   * @param {Object} flight The db object of the flight
   * @param {Array} fixes An array of fixes of the related flight
   * @returns The name of the takeoff site
   */
  attachTakeoffAndLanding: async (
    flight: FlightInstance,
    fixes: FlightFixCombined[]
  ) => {
    const requests = [findClosestTakeoff(fixes[0])];
    if (config.get("useGoogleApi")) {
      // @ts-ignore TODO: How to type this?
      requests.push(findLanding(fixes[fixes.length - 1]));
    }
    const [takeoff, landing] = await Promise.all(requests);

    if (!takeoff) throw new Error("Error while trying to find takeoff");

    flight.siteId = takeoff.id;
    flight.region = takeoff.locationData?.region;

    flight.landing = (landing as unknown as string) ?? "API Disabled";

    return takeoff;
  },

  /**
   * Checks if an flight was uploaded before.
   * The check is done by searching the db for a flight from the same takeoff at the same takeoffTime.
   * If a flight was found an XccupRestrictionError will be thrown.
   *
   * @throws An XccupRestrictionError if an flight was found.
   */
  checkIfFlightWasNotUploadedBefore: async (flight: FlightInstance) => {
    const { XccupRestrictionError } = require("../helper/ErrorHandler");

    const result = await db.Flight.findOne({
      where: {
        // @ts-ignore
        siteId: flight.siteId,
        takeoffTime: flight.takeoffTime,
      },
    });

    // Exit if no result or flight has the same id (possible when recalculating the flight)
    if (!result || flight.id == result.id) return;

    if (
      result.flightStatus == STATE.IN_PROCESS ||
      result.flightStatus == STATE.IN_REVIEW
    ) {
      logger.info(
        `FS: Will delete flight ${result.externalId} which has same takeoff site and time but is still in process state`
      );
      result.destroy();
      logger.debug("FS: flight deleted");
      return;
    }

    if (result)
      throw new XccupRestrictionError(
        `A flight with same takeoff site and time is already present. See Flight with ID ${result.externalId}`
      );
  },

  /**
   * This method will generate a new externalId for a flight by finding the current highest externalId and increment it by one.
   *
   * Postgres does not support auto increment on non PK columns.
   * Therefore a manual auto increment is necessary.
   *
   */
  createExternalId: async () => {
    const externalId =
      (await db.Flight.max<number, FlightInstance>("externalId")) + 1;
    logger.debug("FS: New external ID was created: " + externalId);
    return externalId;
  },
};

async function storeFixesToDB(
  flight: FlightInstance,
  fixes: FlightFixCombined[],
  fixesStats: FlightFixStat[]
) {
  // If a flight was already uploaded before (e.g. this is a rerun) delete the old fixes
  const oldFixesOfFlight = await db.FlightFixes.findOne({
    where: {
      // @ts-ignore
      flightId: flight.id,
    },
  });
  if (oldFixesOfFlight) {
    logger.debug("FS: Delete old fixes of flight: " + flight.externalId);
    oldFixesOfFlight.destroy();
  }

  return db.FlightFixes.create({
    // @ts-ignore
    flightId: flight.id,
    geom: createGeometry(fixes),
    timeAndHeights: extractTimeAndHeights(fixes),
    stats: fixesStats,
  });
}

function attachFlightStats(flight: FlightInstance, fixes: FlightFixCombined[]) {
  const stats = calculateFlightStats(fixes);
  if (!stats) return [];
  flight.flightStats = stats;
  return stats.fixesStats;
}

function createFixesInclude(attributes: string[]) {
  return {
    model: db.FlightFixes,
    as: "fixes",
    attributes,
  };
}

/**
 * Sorts flights of the same day by points. If no external sort query is present.
 */
function createOrderStatement(
  sort?: [string?, string?]
): [string | Fn, string][] {
  if (!(sort && sort[0])) {
    return [
      // Uses the PostgreSQL date_trunc function to truncate the timestamp to a precision of day.
      [sequelize.fn("date_trunc", "day", sequelize.col("takeoffTime")), "DESC"],
      ["flightPoints", "DESC"],
    ];
  }

  if (!sort[1]) return [[sort[0], "DESC"]];

  return [[sort[0], sort[1]]];
}

function calculateTaskSpeed(result: OLCResult, flight: FlightInstance) {
  if (!flight.flightStats || !flight.airtime) return;
  flight.flightStats.taskSpeed =
    Math.round((+result.dist / flight.airtime) * 600) / 10;
  flight.changed("flightStats", true);
}

function calcAirtime(fixes: FlightFixCombined[]) {
  return Math.round(
    (fixes[fixes.length - 1].timestamp - fixes[0].timestamp) / 1000 / 60
  );
}

/**
 * Calculates the length of an array included in every entry of the flights array and add this length as a new property to every flight object.
 *
 * @param {Array} flights An array of flight objects.
 * @param {String} flightProperty The name of the flight property which represents the array which will be counted.
 */
function countRelatedObjects(
  flights: FlightApiResponse[],
  flightProperty: "comments" | "photos"
) {
  flights.forEach((f) => {
    const key = flightProperty + "Count";
    // @ts-ignore TODO: Maybe refactor this to make it easier
    f[key as keyof FlightApiResponse] = Array.isArray(f[flightProperty])
      ? (f[flightProperty] as unknown as string[]).length
      : 0;
    delete f[flightProperty];
  });
}

/**
 * Calculates the points of a flight by the flight distance, flight type and class of glider.
 *
 * @param {*} flight The flight which is the source for distance and type.
 * @param {*} glider The glider which determines the glider class. This glider can be different from the glider currently stored in flight.
 * @returns The points for this flight.
 */
async function calcFlightPoints(flight: FlightInstance, glider: Glider) {
  const currentSeason = await getCurrentActive();
  const gliderClassKey = glider.gliderClass.key;
  const gliderClassDB = currentSeason.gliderClasses[gliderClassKey];

  logger.info(
    `FS: Glider class is ${gliderClassKey}. Will recalculate flightPoints`
  );

  let flightPoints;
  if (flight.flightType && flight.flightDistance) {
    const typeFactor = gliderClassDB.scoringMultiplicator[flight.flightType];
    const gliderFactor = gliderClassDB.scoringMultiplicator.BASE;
    const distance = flight.flightDistance;
    flightPoints = Math.round(typeFactor * gliderFactor * distance);
  } else {
    logger.debug(
      "FS: Flight calculation must be still in process. Will set flightPoints to 0."
    );
    flightPoints = 0;
  }

  logger.info(`FS: Flight calculated with ${flightPoints} points`);

  return flightPoints;
}

async function calcFlightStatus(
  takeoffTime: Date,
  flightPoints: number,
  onlyLogbook?: boolean
) {
  if (!flightPoints) return STATE.IN_PROCESS;

  const currentSeason = await getCurrentActive();
  const isOffSeason = !moment(takeoffTime).isBetween(
    currentSeason.startDate,
    currentSeason.endDate
  );

  if (onlyLogbook || currentSeason.isPaused == true || isOffSeason)
    return STATE.FLIGHTBOOK;

  const pointThreshold = currentSeason.pointThresholdForFlight;

  const flightStatus =
    flightPoints >= pointThreshold ? STATE.IN_RANKING : STATE.NOT_IN_RANKING;

  logger.debug(`FS: Flight status set to ${flightStatus}`);

  return flightStatus;
}

async function createGliderObject(flight: FlightInstance, glider: Glider) {
  const currentSeason = await getCurrentActive();
  const gliderClassDB = currentSeason.gliderClasses[glider.gliderClass.key];

  flight.glider = {
    ...glider,
    gliderClass: {
      key: glider.gliderClass.key,
      description: gliderClassDB.description,
      shortDescription: gliderClassDB.shortDescription,
    },
  };
}

async function retrieveDbObjectOfFlightFixes(flightId: string) {
  const MAX_ATTEMPTS = 1;

  logger.debug("FS: Will retrieve fixes for flight: ", flightId);
  for (let index = 0; index < MAX_ATTEMPTS; index++) {
    const fixes = await db.FlightFixes.findOne({
      where: {
        // @ts-ignore
        flightId,
      },
    });

    if (fixes.geom?.coordinates.length > 0) return fixes;

    logger.warn("FS: Fixes geom was empty. Will try again.");
    sleep(1000);
  }
}

function stripFlightFixesForTodayRanking(flights: FlightAttributes[]) {
  const FIXES_PER_HOUR = 60;

  flights.forEach((entry) => {
    const fixes = entry.fixes?.geom?.coordinates;
    if (!fixes) return;

    const reducedFixes = [];

    //Fixes are stored in db with an interval of 5s
    const step = 3600 / 5 / FIXES_PER_HOUR;

    for (let index = 0; index < fixes.length; index += step) {
      reducedFixes.push({ lat: fixes[index][1], long: fixes[index][0] });
    }
    if (fixes.length % step !== 0) {
      //Add always the last fix
      reducedFixes.push({
        lat: fixes[fixes.length - 1][1],
        long: fixes[fixes.length - 1][0],
      });
    }
    // @ts-ignore TODO: Type the correct return type for this function
    entry.fixes = reducedFixes;
  });
  return flights;
}

/**
 * This function will find flights with are related to a provided flight. This function was replaced by {@link AirbuddyFinder}.
 * A flight is related if,
 * * it was lunched from the same takeoff,
 * * within a timeframe of +- 2h to the provided flight
 * * and exceeds a minimum flightPoints of 30 points (~5km FAI with AB_low)
 *
 * From the testdata the following to flights are related:
 * * 4d7cc8fe-f4ab-49fa-aea3-9b996ff5fa14
 * * 07b590f3-ca8a-4305-88a2-e11c314b4955
 *
 * @param {*} flight The flight to which airBuddies should be found.
 */
async function findAirbuddiesLegacy(flight: FlightAttributes) {
  const timeOffsetValue = 2;
  const timeOffsetUnit = "h";
  const pointThreshold = 30;
  const maxNumberOfBuddies = 10;

  const from = moment(flight.takeoffTime).subtract(
    timeOffsetValue,
    timeOffsetUnit
  );
  const till = moment(flight.takeoffTime).add(timeOffsetValue, timeOffsetUnit);
  const flights = (await db.Flight.findAll({
    where: {
      id: {
        [sequelize.Op.not]: flight.id,
      },
      // @ts-ignore
      siteId: flight.siteId,
      takeoffTime: {
        [sequelize.Op.between]: [from, till],
      },
      flightPoints: {
        [sequelize.Op.gte]: pointThreshold,
      },
    },
    include: createUserInclude(),
    limit: maxNumberOfBuddies,
    order: [["flightPoints", "DESC"]],
  })) as FlightInstanceUserInclude[];
  return flights.map((f: FlightInstanceUserInclude) => {
    return {
      externalId: f.externalId,
      userFirstName: f.user.firstName,
      userLastName: f.user.lastName,
      userId: f.user.id,
    };
  });
}

/**
 * This method will add specific user data (current clubId, teamId and age of the user) to the flight.
 *
 * It's necessary to add team and club id of user directly to the flight.
 * Because user can change its association in the future.
 *
 * @param {*} flight The flight the user data will be attached to.
 */
async function attachUserData(flight: CreateFlightObject) {
  const user = await db.User.findByPk(flight.userId);
  if (!user) return;
  flight.teamId = user.teamId;
  flight.clubId = user.clubId;
  flight.homeStateOfUser =
    user?.address?.country == COUNTRY.DEU
      ? findKeyByValue(USER_STATE, user.address.state)
      : findKeyByValue(COUNTRY, user?.address?.country);
  // @ts-ignore
  flight.ageOfUser = user.getAge();
}

async function createWhereStatement({
  year,
  flightType,
  rankingClass,
  startDate,
  endDate,
  userId,
  gliderClass,
  flightStatus,
  onlyUnchecked,
  includeUnchecked,
}: WhereOptions) {
  let whereStatement;
  if (onlyUnchecked) {
    whereStatement = {
      [sequelize.Op.or]: [
        {
          [sequelize.Op.or]: [
            { airspaceViolation: true },
            { uncheckedGRecord: true },
          ],
          violationAccepted: false,
          // Don't include unfinalized flights (e.g. glider is missing)
          glider: { [sequelize.Op.not]: null },
        },
        { flightStatus: STATE.IN_REVIEW },
      ],
    };
  } else if (!includeUnchecked) {
    whereStatement = {
      [sequelize.Op.or]: [
        { violationAccepted: true },
        {
          airspaceViolation: false,
          uncheckedGRecord: false,
        },
      ],
    };
  } else {
    whereStatement = {
      // Don't include unfinalized flights (e.g. glider is missing)
      glider: { [sequelize.Op.not]: null },
    };
  }
  if (flightType) {
    // @ts-ignore
    whereStatement.flightType = flightType;
  }
  if (flightStatus) {
    // @ts-ignore
    whereStatement.flightStatus = flightStatus;
  } else {
    // @ts-ignore
    whereStatement.flightStatus = {
      [sequelize.Op.not]: STATE.IN_PROCESS,
    };
  }
  if (userId) {
    // @ts-ignore
    whereStatement.userId = userId;
  }
  if (year) {
    // @ts-ignore
    whereStatement.andOp = sequelize.where(
      sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
      year
    );
  }
  if (startDate) {
    const definedEndDate = endDate ? endDate : new Date();
    // @ts-ignore
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: [startDate, definedEndDate],
    };
  }
  if (!startDate && endDate) {
    // @ts-ignore
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: ["2004-01-01", endDate],
    };
  }
  if (rankingClass) {
    const gliderClasses =
      (await getCurrentActive()).rankingClasses[rankingClass].gliderClasses ??
      [];

    whereStatement.glider = {
      // @ts-ignore
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };
  }
  if (gliderClass) {
    whereStatement.glider = {
      // @ts-ignore
      gliderClass: { key: gliderClass },
    };
  }
  return whereStatement;
}

function createSiteInclude(shortName?: string, id?: string) {
  const include = {
    model: db.FlyingSite,
    as: "takeoff",
    attributes: ["id", "shortName", "name", "direction"],
  };
  if (shortName) {
    // @ts-ignore
    include.where = {
      shortName,
    };
  }
  if (id) {
    // @ts-ignore
    include.where = {
      id,
    };
  }
  return include;
}

function createUserInclude(isAdminRequest?: boolean) {
  const attributes = ["id", "firstName", "lastName", "fullName"];

  if (isAdminRequest) attributes.push("email");

  const include = {
    model: db.User,
    as: "user",
    attributes,
  };
  return include;
}

function createClubInclude(id?: string) {
  const include = {
    model: db.Club,
    as: "club",
    attributes: ["id", "name"],
  };
  if (id) {
    // @ts-ignore
    include.where = {
      id,
    };
  }
  return include;
}

function createTeamInclude(id?: string) {
  const include = {
    model: db.Team,
    as: "team",
    attributes: ["id", "name"],
  };
  if (id) {
    // @ts-ignore
    include.where = {
      id,
    };
  }
  return include;
}
export default flightService;
module.exports = flightService;
