const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const { isAdmin, validate } = require("../service/UserService");
const igcValidator = require("../igc/IgcValidator");
const IgcAnalyzer = require("../igc/IgcAnalyzer");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const {
  NOT_FOUND,
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
} = require("../constants/http-status-constants");
const { STATE, IGC_STORE } = require("../constants/flight-constants");
const {
  authToken,
  requesterIsNotOwner,
  requesterIsNotModerator,
  requesterIsNotAdmin,
} = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const logger = require("../config/logger");
const {
  checkStringObjectNotEmpty,
  checkStringObjectNoEscaping,
  checkParamIsInt,
  checkParamIsUuid,
  checkIsUuidObject,
  validationHasErrors,
  checkOptionalIsBoolean,
  queryOptionalColumnExistsInModel,
  checkStringObjectNotEmptyNoEscaping,
  checkIsBoolean,
} = require("./Validation");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const { createFileName } = require("../helper/igc-file-utils");
const config = require("../config/env-config").default;
const {
  XccupRestrictionError,
  XccupHttpError,
} = require("../helper/ErrorHandler");
const CACHE_RELEVANT_KEYS = ["home", "results", "flights"];
const multer = require("multer");
const { getCurrentYear } = require("../helper/Utils");
const userService = require("../service/UserService");
const {
  sendAirspaceViolationMail,
  sendAirspaceViolationAdminMail,
} = require("../service/MailService");

const uploadLimiter = createRateLimiter(60, 10);

// All requests to /flights/photos will be rerouted
router.use("/photos", require("./FlightPhotoController"));

// @desc Retrieves all flights
// @route GET /flights/

router.get(
  "/",
  [
    query("year").optional().isInt(),
    query("site").optional().not().isEmpty().trim().escape(),
    query("siteId").optional().isUUID(),
    query("flightType").optional().not().isEmpty().trim().escape(),
    query("rankingClass").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
    query("offset").optional().isInt(),
    query("startDate").optional().isDate(), //e.g. 2002-07-15
    query("endDate").optional().isDate(), //If not set it will default to todays date
    query("clubId").optional().isUUID(),
    query("teamId").optional().isUUID(),
    query("userId").optional().isUUID(),
    query("sortOrder").optional().isIn(["desc", "DESC", "asc", "ASC"]),
    queryOptionalColumnExistsInModel("sortCol", "Flight"),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const value = getCache(req);
      if (value) return res.json(value);

      const flights = await service.getAll({
        ...req.query,
        sort: [req.query.sortCol, req.query.sortOrder],
      });

      setCache(req, flights);

      res.json(flights);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieves all flights with violations
// @route GET /flights/violations
// @access Only moderator

router.get("/violations", authToken, async (req, res, next) => {
  if (await requesterIsNotModerator(req, res)) return;

  try {
    const flights = await service.getAll({
      onlyUnchecked: true,
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieves all flights of the requester
// @route GET /flights/violations
// @access Only owner

router.get("/self", authToken, async (req, res, next) => {
  try {
    const flights = await service.getAll({
      includeUnchecked: true,
      userId: req.user.id,
      sort: [req.query.sortCol, req.query.sortOrder],
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve a flight by id
// @route GET /flights/:id

router.get("/:id", checkParamIsInt("id"), async (req, res, next) => {
  if (paramIdIsLeonardo(req, res)) return;

  if (validationHasErrors(req, res)) return;

  const flight = await service.getByExternalId(req.params.id);
  if (!flight) return res.sendStatus(NOT_FOUND);

  try {
    res.json(flight);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve the igc file of a flight
// @route GET /flights/igc/:id

router.get("/igc/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params.id;

  try {
    const flight = await service.getById(id, true);

    if (!flight) return res.sendStatus(NOT_FOUND);

    const fullfilepath = path.join(path.resolve(), flight.igcPath);

    return res.download(fullfilepath, (err) => {
      if (err) {
        if (!res.headersSent)
          res.status(NOT_FOUND).send("The file you requested was deleted");
        logger.error(
          "FC: An igc file was requested but seems to be deleted. igcPath: " +
            flight.igcPath
        );
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc Deletes a flight by id
// @route DELETE /flights/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsInt("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const flightId = req.params.id;

    const flight = await service.getByExternalId(flightId);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      if (await requesterIsNotOwner(req, res, flight.userId)) return;

      await checkIfFlightIsModifiable(flight, req.user.id);

      const numberOfDestroyedRows = await service.delete(flight);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Performs a check on the G-Record of a provided IGC-File and if valid persists the IGC-File and starts the result calculation
// @route POST /flights/
// @access All logged-in users

const igcFileUpload = createMulterIgcUploadHandler();
router.post(
  "/",
  uploadLimiter,
  igcFileUpload.single("igcFile"),
  authToken,
  async (req, res, next) => {
    const userId = req.user.id;

    try {
      const validationResult = await igcValidator.execute(req.file);
      if (isGRecordResultInvalid(res, validationResult)) return;

      const flightDbObject = await service.create({
        userId,
        igcPath: req.file.path,
        externalId: req.externalId,
        validationResult,
      });

      const { takeoffName, result, airspaceViolation } =
        await runChecksStartCalculationsStoreFixes(flightDbObject, userId);

      res.json({
        flightId: flightDbObject.id,
        externalId: flightDbObject.externalId,
        airspaceViolation,
        takeoff: takeoffName,
        landing: result.landing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Allows a admin to upload a flight for a user and bypass certain checks.
// @route POST /flights/admin/upload
// @access Only admins

const igcAdminFileUpload = createMulterIgcUploadHandler({ parts: 3 });
router.post(
  "/admin/upload",
  igcAdminFileUpload.single("igcFile"),
  checkIsUuidObject("userId"),
  checkIsBoolean("skipGCheck"),
  authToken,
  async (req, res, next) => {
    try {
      if (await requesterIsNotAdmin(req, res)) return;

      const userId = req.body.userId;
      const userGliders = await userService.getGlidersById(userId);
      if (!userGliders) return res.sendStatus(NOT_FOUND);

      const validationResult = await igcValidator.execute(req.file);

      /** A non igc file will now throw a 500 because the parsing will
       * fail and parsing is currently not in a try/catch block.
       * This can only happen to admins because all files with valid G-Record
       * are pretty sure valid igc files.
       * So live with the 500 error or refactor the code to make it more robust.
       */

      if (req.body.skipGCheck === "true") {
        logger.info("FC: Skipping G-Check for admin upload");
      } else {
        if (isGRecordResultInvalid(res, validationResult)) return;
      }

      const flightDbObject = await service.create({
        userId,
        igcPath: req.file.path,
        externalId: req.externalId,
        validationResult,
      });

      const { takeoffName, result, airspaceViolation } =
        await runChecksStartCalculationsStoreFixes(flightDbObject, userId);

      const glider = userGliders.gliders.find(
        (g) => g.id == userGliders.defaultGlider
      );
      if (!glider)
        return res
          .status(BAD_REQUEST)
          .send("No default glider configured in profile");

      service.finalizeFlightSubmission({ flight: flightDbObject, glider });

      res.json({
        flightId: flightDbObject.id,
        externalId: flightDbObject.externalId,
        airspaceViolation,
        takeoff: takeoffName,
        landing: result.landing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Allows a admin to rerun a flight calculation; Which includes also the location and elevation requests
// @route POST /flights/admin/rerun
// @access Only moderators and admins

router.get(
  "/admin/rerun/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

      const flight = await service.getById(req.params.id);
      if (!flight) return res.sendStatus(NOT_FOUND);

      const { airspaceViolation } = await runChecksStartCalculationsStoreFixes(
        flight,
        null,

        // TODO: Should the recalculation really always skip all checks?
        { skipChecks: true }
      );

      res.json({
        airspaceViolation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Allows to upload a flight via the leonardo format directly from a tracker
// @route POST /flights/leonardo

const leonardoUpload = multer();
router.post(
  "/leonardo",
  uploadLimiter,
  leonardoUpload.none(),
  checkStringObjectNotEmpty("user"),
  checkStringObjectNotEmptyNoEscaping("pass"),
  checkStringObjectNotEmptyNoEscaping("IGCigcIGC"),
  checkStringObjectNotEmptyNoEscaping("igcfn"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const igc = { body: req.body.IGCigcIGC, name: req.body.igcfn };

    try {
      const user = await validate(req.body.user, req.body.pass);
      if (!user) return res.sendStatus(UNAUTHORIZED);

      const glider = user.gliders.find((g) => g.id == user.defaultGlider);
      if (!glider)
        return (
          res
            .status(BAD_REQUEST)
            // TODO: Should this be in german as it's shown to the user?
            .send("No default glider configured in profile")
        );

      // const validationResult = await igcValidator.execute(igc);
      // if (isGRecordResultInvalid(res, validationResult)) return;
      const externalId = await service.createExternalId();
      const igcPath = await persistIgcFile(externalId, igc);

      const flightDbObject = await service.create({
        userId: user.id,
        igcPath,
        externalId,
        validationResult: false,
      });

      const { airspaceViolation } = await runChecksStartCalculationsStoreFixes(
        flightDbObject,
        user.id
      );

      await service.finalizeFlightSubmission({
        flight: flightDbObject,
        glider,
      });

      deleteCache(CACHE_RELEVANT_KEYS);

      let message = `Der Flug wurde mit dem Gerät ${glider.brand} ${
        glider.model
      } eingereicht. Du findest deinen Flug unter ${config.get(
        "clientUrl"
      )}${config.get("clientFlight")}/${flightDbObject.externalId}.`;

      if (airspaceViolation) {
        message +=
          "\nDein Flug hatte eine Luftraumverletzung. Bitte ergänze eine Begründung in der Online-Ansicht. Wir prüfen diese so schnell wie möglich.";
        sendAirspaceViolationMail(flightDbObject);
      }

      res.status(OK).send(message);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits flightReport, flightStatus and glider of a existing flight and calcs the flightPoints
// @route PUT /flights/:id
// @access Only owner

router.put(
  "/:id",
  uploadLimiter,
  authToken,
  checkParamIsUuid("id"),
  checkStringObjectNoEscaping("report"),
  checkStringObjectNoEscaping("airspaceComment"),
  checkOptionalIsBoolean("onlyLogbook"),
  checkIsUuidObject("glider.id"),
  checkStringObjectNotEmpty("glider.brand"),
  checkStringObjectNotEmpty("glider.model"),
  checkStringObjectNotEmpty("glider.gliderClass.key"),
  checkOptionalIsBoolean("hikeAndFly"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const flight = await service.getById(req.params.id, true);

    if (!flight) return res.sendStatus(NOT_FOUND);

    const { report, airspaceComment, onlyLogbook, glider, hikeAndFly } =
      req.body;

    try {
      if (await requesterIsNotOwner(req, res, flight.userId)) return;

      await checkIfFlightIsModifiable(flight, req.user.id);

      await service.finalizeFlightSubmission({
        flight,
        report,
        airspaceComment,
        onlyLogbook,
        glider,
        hikeAndFly,
      });

      deleteCache(CACHE_RELEVANT_KEYS);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Marks a flight with violations as accepted
// @route PUT /flights/acceptViolation/:id
// @access Only moderator

router.put(
  "/acceptViolation/:id",
  authToken,
  checkParamIsUuid("id"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const flight = await service.getById(req.params.id, true);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      if (await requesterIsNotModerator(req, res)) return;

      await service.acceptViolation(flight);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * This functions checks if a flight
 * - was not maniplulated
 * - is modifiable (<= X days or admin)
 * - was not uploaded before
 * - has an airspace violation
 *
 * calculates the following values
 * - takeoff and landing
 * - times (e.g. takeoff, duration)
 * - fixes stats
 * - fixes elevation data
 *
 * stores the flight fixes to the DB and starts the OLC algorithm
 */
async function runChecksStartCalculationsStoreFixes(
  flightDbObject,
  userId,
  { skipChecks = false } = {}
) {
  const fixes = IgcAnalyzer.extractFixes(flightDbObject);

  if (!skipChecks) checkIfFlightIsManipulated(fixes);
  service.attachFixRelatedTimeDataToFlight(flightDbObject, fixes);
  if (!skipChecks) await checkIfFlightIsModifiable(flightDbObject, userId);
  const takeoff = await service.attachTakeoffAndLanding(flightDbObject, fixes);

  if (!skipChecks) detectMidFlightIgcStart(takeoff, fixes);
  await service.checkIfFlightWasNotUploadedBefore(flightDbObject);
  await service.storeFixesAndAddStats(flightDbObject, fixes);

  const result = await service.update(flightDbObject);

  // Run in parallel
  const [airspaceViolation] = await Promise.all([
    service.attachElevationDataAndCheckForAirspaceViolations(flightDbObject),
    service.startResultCalculation(flightDbObject),
  ]);

  if (airspaceViolation) sendAirspaceViolationAdminMail(userId, flightDbObject);

  return { takeoffName: takeoff.name, result, airspaceViolation };
}

function paramIdIsLeonardo(req, res) {
  if (
    !(
      typeof req.params.id == "string" &&
      req.params.id.toLowerCase() == "leonardo"
    )
  )
    return;

  return res.status(BAD_REQUEST).send(`Zur Nutzung des Leonardo Endpunktes:<br/>
  <br/>
  URL: https://xccup.net/api/flights/leonardo<br/>
  HTTP-Method: POST<br/>
  Content-Type: multipart/form-data<br/>
  <br/>
  Fields:<br/>
  * user: Deine Login E-Mail<br/>
  * pass: Dein Login Passwort<br/>
  * IGCigcIGC: Der Inhalt der IGC-Datei (plain-text)<br/>
  * igcfn: Der Name der IGC-Datei<br/>
  <br/>
  Bemerkung:<br/>
  Zur Berechnung der Punkte wird das Fluggerät, welches im Nutzerprofil als Standart definiert wurde, herangezogen. 

  `);
}

function createMulterIgcUploadHandler({ parts = 1 } = {}) {
  const dataPath = config.get("dataPath");
  const igcStorage = multer.diskStorage({
    destination: path
      .join(dataPath, IGC_STORE, getCurrentYear().toString())
      .toString(),
    filename: function (req, file, cb) {
      service.createExternalId().then((externalId) => {
        req.externalId = externalId;
        cb(null, externalId + "_" + file.originalname);
      });
    },
  });
  return multer({
    storage: igcStorage,
    limits: {
      fileSize: 2097152,
      files: 1,
      parts,
    },
  });
}

async function persistIgcFile(externalId, igcFile) {
  const pathToFile = createFileName(externalId, igcFile.name);

  const fsPromises = fs.promises;
  logger.debug(`FC: Will write received IGC File to: ${pathToFile}`);
  await fsPromises.writeFile(pathToFile.toString(), igcFile.body);
  return pathToFile;
}

/**
 * Flight upload or modifactions to an already processed flight are only allowed within the first X days after takeoff.
 * There are some exceptions from this rule:
 * - If system is not in production
 * - If the user is an admin
 * - If the env var "overruleActive" was set to true
 *
 * @param {*} flight The flight db object
 * @param {*} userId The id of the user who initiated the request
 * @throws A XccupRestrictionError if the requirements are not meet.
 */
async function checkIfFlightIsModifiable(flight, userId) {
  const daysFlightEditable = config.get("daysFlightEditable");
  // Allow flight uploads which are older than X days when not in production (Needed for testing)
  const overwriteIfInProcessAndNotProduction =
    (flight.flightStatus == STATE.IN_PROCESS &&
      config.get("env") !== "production") ||
    config.get("overruleActive");

  const flightIsYoungerThanThreshold = moment(flight.takeoffTime)
    .add(daysFlightEditable, "days")
    .isAfter(moment());

  if (overwriteIfInProcessAndNotProduction) return;
  if (flightIsYoungerThanThreshold) return;
  if (await isAdmin(userId)) return;

  throw new XccupRestrictionError(
    `It's not possible to change a flight later than ${daysFlightEditable} days after takeoff`
  );
}

/**
 * Checks if the igc parser marked a result as manipulated and throws an error if it was manipulated.
 *
 * @param {string | Array} resultOfIgcParser The result of the igc parser
 */
function checkIfFlightIsManipulated(resultOfIgcParser) {
  let errorMessage = "Manipulated IGC-File";
  if (
    typeof resultOfIgcParser === "string" &&
    resultOfIgcParser === "manipulated"
  )
    throw new XccupHttpError(BAD_REQUEST, errorMessage, errorMessage);
}

/**
 * Checks if an igc file starts mid flight.
 * If the first fix of an igc file is 250m above takeoff elevation it is
 * considered to be a mid flight start.
 * Throws an error and sends a BAD_REQUEST as response if a mid flight
 * start is detected.
 * @param {object} takeoff The takeoff object
 * @param {object} fixes The flights fixes
 */
function detectMidFlightIgcStart(takeoff, fixes) {
  const MAX_START_ALT_OVER_TAKEOFF = 250;

  if (fixes[0]?.gpsAltitude > takeoff.elevation + MAX_START_ALT_OVER_TAKEOFF) {
    let errorMessage = "Flight starts in the middle of a flight";

    throw new XccupHttpError(BAD_REQUEST, errorMessage, errorMessage);
  }
}

/**
 * Checks if the validation result is defined and if the result is != PASSED sends a BAD_REQUEST response to the user.
 * @param {Response} res The response object of the current request
 * @param {boolean} validationResult The result to check
 * @returns true if the result is invalid otherwise undefined
 */
function isGRecordResultInvalid(res, validationResult) {
  if (!validationResult) {
    logger.warn("FC: G-Record Validation returned undefined");
  } else if (validationResult != igcValidator.G_RECORD_PASSED) {
    logger.info(
      "FC: Invalid G-Record found. Validation result: " + validationResult
    );
    res.status(BAD_REQUEST).send("Invalid G-Record");
    return true;
  }
  return false;
}

module.exports = router;
