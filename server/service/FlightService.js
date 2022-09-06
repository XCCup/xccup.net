const sequelize = require("sequelize");
const FlightComment = require("../db")["FlightComment"];
const Flight = require("../db")["Flight"];
const User = require("../db")["User"];
const Team = require("../db")["Team"];
const Club = require("../db")["Club"];
const Brand = require("../db")["Brand"];
const FlightPhoto = require("../db")["FlightPhoto"];
const FlyingSite = require("../db")["FlyingSite"];
const FlightFixes = require("../db")["FlightFixes"];

const moment = require("moment");

const IgcAnalyzer = require("../igc/IgcAnalyzer");
const { findLanding } = require("../igc/LocationFinder");
const ElevationAttacher = require("../igc/ElevationAttacher");
const FlightStatsCalculator = require("../igc/FlightStatsCalculator");
const { getCurrentActive } = require("./SeasonService");
const { findClosestTakeoff } = require("./FlyingSiteService");
const { hasAirspaceViolation } = require("./AirspaceService");
const {
  sendAirspaceViolationAcceptedMail,
  sendAirspaceViolationRejectedMail,
  sendNewAdminTask,
} = require("./MailService");

const { isNoWorkday } = require("../helper/HolidayCalculator");
const { sleep, findKeyByValue } = require("../helper/Utils");
const { deleteIgcFile } = require("../helper/igc-file-utils");

const { COUNTRY, STATE: USER_STATE } = require("../constants/user-constants");
const { STATE } = require("../constants/flight-constants");

const logger = require("../config/logger");
const config = require("../config/env-config").default;

const { deleteCache } = require("../controller/CacheManager");
const {
  createGeometry,
  extractTimeAndHeights,
  combineFixesProperties,
} = require("../helper/FlightFixUtils");
const { checkSiteRecordsAndUpdate } = require("./SiteRecordCache");

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
  } = {}) => {
    const orderStatement = createOrderStatement(sort);

    const queryObject = {
      include: [
        createUserInclude(isAdminRequest),
        createSiteInclude(site, siteId),
        createTeamInclude(teamId),
        createClubInclude(clubId),

        // The includes for photos and comments are only present to count the releated objects
        {
          model: FlightPhoto,
          as: "photos",
          attributes: ["id"],
        },
        {
          model: FlightComment,
          as: "comments",
          attributes: ["id"],
        },
      ],
      where: await createWhereStatement(
        year,
        flightType,
        rankingClass,
        startDate,
        endDate,
        userId,
        gliderClass,
        status,
        onlyUnchecked,
        includeUnchecked
      ),
      order: orderStatement,
    };

    if (limit) {
      queryObject.limit = limit;
    }

    if (offset) {
      queryObject.offset = offset;
    }

    if (minimumData) {
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
     * distinct=true was necesseary after photos and comments where included
     * https://github.com/sequelize/sequelize/issues/9481
     * */
    queryObject.distinct = true;

    const flights = await Flight.findAndCountAll(queryObject);

    /**
     * Without mapping "FATAL ERROR: v8::Object::SetInternalField() Internal field out of bounds" occurs.
     * This is due to the fact that node-cache can't clone sequelize objects with active tcp handles.
     * See also: https://github.com/pvorb/clone/issues/106
     */

    flights.rows = flights.rows.map((v) => v.toJSON());

    countRelatedObjects(flights.rows, "photos");
    countRelatedObjects(flights.rows, "comments");

    return flights;
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
    const fromDate = new Date(today.getFullYear(), today.getMonth(), fromDay);
    const tillDate = new Date(today.getFullYear(), today.getMonth(), tillDay);

    const queryObject = {
      include: [
        createUserInclude(),
        createFixesInclude(["geom"]),
        createSiteInclude(),
      ],
      where: await createWhereStatement(null, null, null, fromDate, tillDate),
      order: [["flightPoints", "DESC"]],
    };

    const flightDbObjects = await Flight.findAll(queryObject);

    const flights = stripFlightFixesForTodayRanking(flightDbObjects);

    return flights;
  },

  getById: async (id, noIncludes) => {
    const includes = [
      createSiteInclude(),
      createFixesInclude(["geom", "timeAndHeights"]),
    ];
    return await Flight.findOne({
      where: { id },
      include: noIncludes ? [] : includes,
    });
  },

  getByExternalId: async (externalId, { excludeSecrets } = {}) => {
    const blackListedDataAttributes = [
      "airspaceViolations",
      "airspaceViolation",
      "violationAccepted",
    ];
    const exclude = excludeSecrets ? blackListedDataAttributes : null;

    const flightDbObject = await Flight.findOne({
      where: { externalId },
      include: [
        createFixesInclude(["geom", "timeAndHeights", "stats"]),
        createUserInclude(),
        createSiteInclude(),
        createClubInclude(),
        createTeamInclude(),
        {
          model: FlightComment,
          as: "comments",
          include: [createUserInclude()],
        },
        {
          model: FlightPhoto,
          as: "photos",
        },
      ],
      attributes: { exclude },
      order: [
        [{ model: FlightComment, as: "comments" }, "createdAt", "ASC"],
        [{ model: FlightPhoto, as: "photos" }, "createdAt", "ASC"],
      ],
    });
    if (flightDbObject) {
      const flight = flightDbObject.toJSON();
      //TODO: Merge directly when model is retrieved?
      flight.fixes = combineFixesProperties(flight.fixes);

      // Even though we have now a better airbuddy algo this is still here to support older flights with airbuddies
      if (!flight.airbuddies)
        flight.airbuddies = await findAirbuddiesLegacy(flight);

      return flight;
    }
    return null;
  },

  sumDistance: async (year) => {
    const totalDistance = await Flight.sum("flightDistance", {
      where: {
        andOp: sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
          year
        ),
      },
    });
    return Math.round(totalDistance);
  },

  sumFlightColumnByUser: async (columnName, userId) => {
    const sum = await Flight.sum(columnName, {
      where: {
        userId,
      },
    });
    return Math.round(sum);
  },

  countFlightsByUser: async (userId) => {
    return Flight.count({
      where: {
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
    const brands = await Brand.findAll({ order: [["name", "ASC"]] });
    return brands.map((e) => e.name);
  },

  update: async (flight) => {
    return flight.save();
  },

  acceptViolation: async (flight) => {
    flight.violationAccepted = true;
    flight.flightStatus = await calcFlightStatus(
      flight.takeoffTime,
      flight.flightPoints,
      flight.onlyLogbook
    );

    const result = await flight.save();
    sendAirspaceViolationAcceptedMail(flight);
    return result;
  },

  rejectViolation: async (flight, { message }) => {
    sendAirspaceViolationRejectedMail(flight, message);
    flightService.delete(flight);
  },

  /**
   * Updates one or serveral properties of a flight model.
   *
   * @param {*} id The ID of the flight to update
   * @param {*} props The properties of the flight model which should be updated
   * @return 1 if an entry was updated; 0 when no entry was updated
   */
  changeFlightProps: async (id, props = {}) => {
    return (await Flight.update(props, { where: { id } }))[0];
  },

  finalizeFlightSubmission: async ({
    flight,
    report,
    airspaceComment,
    onlyLogbook,
    glider,
    hikeAndFly,
  } = {}) => {
    // Set report when value is defined or empty
    if (report || report == "") {
      flight.report = report;
    }
    if (airspaceComment || airspaceComment == "") {
      flight.airspaceComment = airspaceComment;
    }

    if (hikeAndFly) {
      const site = await FlyingSite.findByPk(flight.siteId, {
        attributes: ["heightDifference"],
      });
      flight.hikeAndFly = site.heightDifference;
    }
    if (hikeAndFly == 0) {
      flight.hikeAndFly = 0;
    }

    if (glider) {
      await createGliderObject(flight, glider);

      const flightPoints = await calcFlightPoints(flight, glider);
      flight.flightPoints = flightPoints;

      if (flight.flightStatus != STATE.IN_REVIEW) {
        const flightStatus = await calcFlightStatus(
          flight.takeoffTime,
          flightPoints,
          onlyLogbook
        );
        flight.flightStatus = flightStatus;
      }
    }

    if (flight.airspaceViolation) {
      sendNewAdminTask();
    }

    const updatedColumns = await flight.save();
    checkSiteRecordsAndUpdate(flight);
    return updatedColumns;
  },

  delete: async (flight) => {
    deleteIgcFile(flight.igcPath);
    return Flight.destroy({ where: { id: flight.id } });
  },

  addResult: async (result) => {
    logger.info("FS: Will add igc result to flight " + result.id);
    const flight = await flightService.getById(result.id, true);

    if (!flight) {
      // This can occur if a user uploads the same igc file again before the calculation has finished.
      logger.warn(
        `FS: Could not add result to flight ${result.id} because the flight wasn't found`
      );
      return;
    }

    flight.flightDistance = result.dist;
    flight.flightType = result.type;
    flight.flightTurnpoints = result.turnpoints;
    calculateTaskSpeed(result, flight);

    if (flight.glider) {
      // If true, the calculation took so long that the glider was already submitted by the user.
      // Therefore calculation of points and status can and will be started here.
      const flightPoints = await calcFlightPoints(flight, flight.glider);
      flight.flightPoints = flightPoints;

      if (flight.flightStatus != STATE.IN_REVIEW) {
        const flightStatus = await calcFlightStatus(
          flight.takeoffTime,
          flight.flightPoints
        );
        flight.flightStatus = flightStatus;
      }
    }

    flight.save();
    checkSiteRecordsAndUpdate(flight);
    deleteCache(["home", "flights", "results"]);
  },

  attachElevationDataAndCheckForAirspaceViolations: async (flight) => {
    const fixes = await retrieveDbObjectOfFlightFixes(flight.id);

    // eslint-disable-next-line no-unused-vars
    await new Promise(function (resolve, reject) {
      ElevationAttacher.execute(
        combineFixesProperties(fixes),
        async (fixesWithElevation) => {
          for (let i = 0; i < fixes.timeAndHeights.length; i++) {
            fixes.timeAndHeights[i].elevation = fixesWithElevation[i].elevation;
          }
          /**
           * It is necessary to explicit call "changed", because a call to "save" will only updated data when a value has changed.
           * Unforunatly the addition of elevation data inside the data object doesn't trigger any change event.
           */
          fixes.changed("timeAndHeights", true);
          await fixes.save();
          resolve();
        }
      );
    });

    /**
     * Before evaluating airspace violation it's necessary to determine the elevation data.
     * Because some airspace boundaries are defined in relation to the surface (e.g. Floor 1500FT AGL)
     */
    const violationResult = await hasAirspaceViolation(fixes);
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
  }) => {
    const flight = {
      userId,
      igcPath,
      externalId,
      uploadEndpoint,
      uncheckedGRecord: validationResult == undefined ? true : false,
      flightStatus: STATE.IN_PROCESS,
    };

    await attachUserData(flight);
    return Flight.create(flight);
  },

  startResultCalculation: async (flight) => {
    const flightTypeFactors = (await getCurrentActive()).flightTypeFactors;
    IgcAnalyzer.startCalculation(flight, flightTypeFactors, (result) => {
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
  attachFixRelatedTimeDataToFlight: (flight, fixes) => {
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
  storeFixesAndAddStats: async (flight, fixes) => {
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
  attachTakeoffAndLanding: async (flight, fixes) => {
    const requests = [findClosestTakeoff(fixes[0])];
    if (config.get("useGoogleApi")) {
      requests.push(findLanding(fixes[fixes.length - 1]));
    }
    const [takeoff, landing] = await Promise.all(requests);

    flight.siteId = takeoff.id;
    flight.region = takeoff.region;
    flight.landing = landing ?? "API Disabled";

    return takeoff;
  },

  /**
   * Checks if an flight was uploaded before.
   * The check is done by searching the db for a flight from the same takeoff at the same takeoffTime.
   * If a flight was found an XccupRestrictionError will be thrown.
   *
   * @param {*} siteId The id of the takeoff of the current flight.
   * @param {*} takeoffTime The takeoffTime of the current flight.
   * @throws An XccupRestrictionError if an flight was found.
   */
  checkIfFlightWasNotUploadedBefore: async (flight) => {
    const { XccupRestrictionError } = require("../helper/ErrorHandler");

    const result = await Flight.findOne({
      where: {
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
   * This method will generate a new externalId for a flight by finding the current heightest externalId and increment it by one.
   *
   * Postgres does not support auto increment on non PK columns.
   * Therefore a manual auto increment is necessary.
   *
   * @param {*} flight The flight the externalId will be attached to.
   */
  createExternalId: async () => {
    const externalId = (await Flight.max("externalId")) + 1;
    logger.debug("FS: New external ID was created: " + externalId);
    return externalId;
  },
};

async function storeFixesToDB(flight, fixes, fixesStats) {
  // If a flight was already uploaded before (e.g. this is a rerun) delete the old fixes
  const oldFixesOfFlight = await FlightFixes.findOne({
    where: {
      flightId: flight.id,
    },
  });
  if (oldFixesOfFlight) {
    logger.debug("FS: Delete old fixes of flight: " + flight.externalId);
    oldFixesOfFlight.destroy();
  }

  return FlightFixes.create({
    flightId: flight.id,
    geom: createGeometry(fixes),
    timeAndHeights: extractTimeAndHeights(fixes),
    stats: fixesStats,
  });
}

function attachFlightStats(flight, fixes) {
  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);
  flight.flightStats = {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
  };
  return fixesStats;
}

function createFixesInclude(attributes) {
  return {
    model: FlightFixes,
    as: "fixes",
    attributes,
  };
}

/**
 * Sorts flights of the same day by points. If no external sort query is present.
 */
function createOrderStatement(sort) {
  if (!(sort && sort[0])) {
    return [
      // Uses the PostgreSQL date_trunc function to truncate the timestamp to a precision of day.
      [sequelize.fn("date_trunc", "day", sequelize.col("takeoffTime")), "DESC"],
      ["flightPoints", "DESC"],
    ];
  }

  if (!sort[1]) {
    return [[sort[0], "DESC"]];
  }

  return [sort];
}

function calculateTaskSpeed(result, flight) {
  if (!flight.flightStats) return;
  flight.flightStats.taskSpeed =
    Math.round((result.dist / flight.airtime) * 600) / 10;
  flight.changed("flightStats", true);
}

function calcAirtime(fixes) {
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
function countRelatedObjects(flights, flightProperty) {
  flights.forEach((f) => {
    f[flightProperty + "Count"] = f[flightProperty]?.length
      ? f[flightProperty].length
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
async function calcFlightPoints(flight, glider) {
  const currentSeason = await getCurrentActive();
  const gliderClassKey = glider.gliderClass.key;
  const gliderClassDB = currentSeason.gliderClasses[gliderClassKey];

  logger.info(
    `FS: Glider class is ${gliderClassKey}. Will recalculate flightPoints`
  );

  let flightPoints;
  if (flight.flightType && flight.flightDistance) {
    // const typeFactor = currentSeason.flightTypeFactors[flight.flightType];
    // const gliderFactor = gliderClassDB.scoringMultiplicator;
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

async function calcFlightStatus(takeoffTime, flightPoints, onlyLogbook) {
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

async function createGliderObject(flight, glider) {
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

async function retrieveDbObjectOfFlightFixes(flightId) {
  const MAX_ATTEMPTS = 1;

  logger.debug("FS: Will retrieve fixes for flight: ", flightId);
  for (let index = 0; index < MAX_ATTEMPTS; index++) {
    const fixes = await FlightFixes.findOne({
      where: {
        flightId,
      },
    });

    if (fixes.geom?.coordinates.length > 0) return fixes;

    logger.warn("FS: Fixes geom was empty. Will try again.");
    sleep(1000);
  }
}

function stripFlightFixesForTodayRanking(flightDbObjects) {
  const FIXES_PER_HOUR = 60;
  const flights = flightDbObjects.map((entry) => entry.toJSON());
  flights.forEach((entry) => {
    const fixes = entry.fixes.geom?.coordinates;
    entry.fixes = [];

    //Fixes are stored in db with an interval of 5s
    const step = 3600 / 5 / FIXES_PER_HOUR;

    for (let index = 0; index < fixes.length; index += step) {
      entry.fixes.push({ lat: fixes[index][1], long: fixes[index][0] });
    }
    if (fixes.length % step !== 0) {
      //Add always the last fix
      entry.fixes.push({
        lat: fixes[fixes.length - 1][1],
        long: fixes[fixes.length - 1][0],
      });
    }
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
async function findAirbuddiesLegacy(flight) {
  const timeOffsetValue = 2;
  const timeOffsetUnit = "h";
  const pointThreshold = 30;
  const maxNumberOfBuddies = 10;

  const from = moment(flight.takeoffTime).subtract(
    timeOffsetValue,
    timeOffsetUnit
  );
  const till = moment(flight.takeoffTime).add(timeOffsetValue, timeOffsetUnit);
  const flights = await Flight.findAll({
    where: {
      id: {
        [sequelize.Op.not]: flight.id,
      },
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
  });
  return flights.map((f) => {
    return {
      externalId: f.externalId,
      percentage: "n/a",
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
 * Because user can change its assocation in the future.
 *
 * @param {*} flight The flight the user data will be attached to.
 */
async function attachUserData(flight) {
  const user = await User.findByPk(flight.userId);
  flight.teamId = user.teamId;
  flight.clubId = user.clubId;
  flight.homeStateOfUser =
    user.address.country == COUNTRY.DEU
      ? findKeyByValue(USER_STATE, user.address.state)
      : findKeyByValue(COUNTRY, user.address.country);
  flight.ageOfUser = user.getAge();
}

async function createWhereStatement(
  year,
  flightType,
  rankingClass,
  startDate,
  endDate,
  userId,
  gliderClass,
  flightStatus,
  onlyUnchecked,
  includeUnchecked
) {
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
    whereStatement.flightType = flightType;
  }
  if (flightStatus) {
    whereStatement.flightStatus = flightStatus;
  } else {
    whereStatement.flightStatus = {
      [sequelize.Op.not]: STATE.IN_PROCESS,
    };
  }
  if (userId) {
    whereStatement.userId = userId;
  }
  if (year) {
    whereStatement.andOp = sequelize.where(
      sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
      year
    );
  }
  if (startDate) {
    const definedEndDate = endDate ? endDate : new Date();
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: [startDate, definedEndDate],
    };
  }
  if (!startDate && endDate) {
    whereStatement.takeoffTime = {
      [sequelize.Op.between]: ["2004-01-01", endDate],
    };
  }
  if (rankingClass) {
    const gliderClasses =
      (await getCurrentActive()).rankingClasses[rankingClass].gliderClasses ??
      [];

    whereStatement.glider = {
      gliderClass: { key: { [sequelize.Op.in]: gliderClasses } },
    };
  }
  if (gliderClass) {
    whereStatement.glider = {
      gliderClass: { key: gliderClass },
    };
  }
  return whereStatement;
}

function createSiteInclude(shortName, id) {
  const include = {
    model: FlyingSite,
    as: "takeoff",
    attributes: ["id", "shortName", "name", "direction"],
  };
  if (shortName) {
    include.where = {
      shortName,
    };
  }
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

function createUserInclude(isAdminRequest) {
  const attributes = ["id", "firstName", "lastName", "fullName"];

  if (isAdminRequest) attributes.push("email");

  const include = {
    model: User,
    as: "user",
    attributes,
  };
  return include;
}

function createClubInclude(id) {
  const include = {
    model: Club,
    as: "club",
    attributes: ["id", "name"],
  };
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

function createTeamInclude(id) {
  const include = {
    model: Team,
    as: "team",
    attributes: ["id", "name"],
  };
  if (id) {
    include.where = {
      id,
    };
  }
  return include;
}

module.exports = flightService;
