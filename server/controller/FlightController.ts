import express, { NextFunction, Request, Response } from "express";
import service from "../service/FlightService";
import { isAdmin, validate } from "../service/UserService";
import { FaiResponse, validateIgc } from "../igc/IgcValidator";
import { extractFixes } from "../igc/IgcAnalyzer";
import path from "path";
import moment from "moment";
import fs from "fs";
import {
  NOT_FOUND,
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
  NO_CONTENT,
} from "../constants/http-status-constants";
import {
  STATE,
  IGC_STORE,
  UPLOAD_ENDPOINT,
  IGC_MAX_SIZE,
} from "../constants/flight-constants";
import {
  requesterMustBeLoggedIn,
  requesterIsNotOwner,
  requesterMustBeAdmin,
  requesterMustBeModerator,
  userHasElevatedRole,
} from "./Auth";
import { createLimiter } from "./api-protection";
import { query } from "express-validator";
import { getMetarData } from "../helper/METAR";
import logger from "../config/logger";
import {
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
  checkOptionalStringObjectNotEmpty,
} from "./Validation";
import { combineFixesProperties } from "../helper/FlightFixUtils";
import { getCache, setCache, deleteCache } from "./CacheManager";
import { createFileName } from "../helper/igc-file-utils";
import config from "../config/env-config";
import { XccupRestrictionError, XccupHttpError } from "../helper/ErrorHandler";
import multer from "multer";
import { getCurrentYear } from "../helper/Utils";
import userService from "../service/UserService";
import MailService from "../service/MailService";
import { findAirbuddies } from "../igc/AirbuddyFinder";
import { LEONARDO_ENDPOINT_MESSAGE } from "../constants/leonardo-endpoint-message";
import { FlightInstance } from "../db/models/Flight";
import { FlightFixCombined } from "../types/FlightFixes";
import { FlyingSiteAttributes } from "../db/models/FlyingSite";

const CACHE_RELEVANT_KEYS = ["home", "results", "flights"];

interface IgcFile {
  body: string;
  name: string;
}

const router = express.Router();

const uploadLimiter = createLimiter(60, 10);

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
  async (req: Request, res: Response, next: NextFunction) => {
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

router.get(
  "/violations",
  requesterMustBeModerator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flights = await service.getAll({
        onlyUnchecked: true,
        isAdminRequest: true,
      });

      res.json(flights);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieves all flights of the requester
// @route GET /flights/violations
// @access Only owner

router.get(
  "/self",
  requesterMustBeLoggedIn,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flights = await service.getAll({
        includeUnchecked: true,
        userId: req.user?.id,
        sort: [req.query.sortCol as string, req.query.sortOrder as string],
      });

      res.json(flights);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieve a flight by id
// @route GET /flights/:id

router.get(
  "/:id",
  checkParamIsInt("id"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (paramIdIsLeonardo(req, res)) return;

    if (validationHasErrors(req, res)) return;

    const flight = await service.getByExternalId(+req.params.id, {
      excludeSecrets: !userHasElevatedRole(req.user),
    });
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      res.json(flight);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieve the igc file of a flight
// @route GET /flights/igc/:id

router.get(
  "/igc/:id",
  checkParamIsUuid("id"),
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

// @desc Deletes a flight by id
// @route DELETE /flights/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsInt("id"),
  requesterMustBeLoggedIn,
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;
    const flightId = req.params.id;

    const flight = await service.getByExternalId(+flightId);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      if (requesterIsNotOwner(req, res, flight.userId)) return;

      await checkIfFlightIsModifiable(flight, req.user?.id);

      const numberOfDestroyedRows = await service.delete(flight);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Performs a check on the G-Record of a provided IGC-File and if valid saves the IGC-File and starts the result calculation
// @route POST /flights/
// @access All logged-in users

const igcFileUpload = createMulterIgcUploadHandler();
router.post(
  "/",
  uploadLimiter,
  igcFileUpload.single("igcFile"),
  requesterMustBeLoggedIn,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    try {
      // G-Check
      const validationResult = await validateIgc(req.file);
      if (
        isGRecordResultInvalid(res, validationResult) &&
        userId &&
        req.file?.path
      ) {
        MailService.sendGCheckInvalidAdminMail(userId, req.file?.path);
        return;
      }

      // DB Object
      const flightDbObject = await service.create({
        userId,
        igcPath: req.file?.path,
        externalId: req.externalId,
        uploadEndpoint: UPLOAD_ENDPOINT.WEB,
        validationResult,
      });

      // Airspace check / takeoff name / result calculation
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

// @desc Allows an admin to upload a flight for a user and bypass certain checks.
// @route POST /flights/admin/upload
// @access Only admins

const igcAdminFileUpload = createMulterIgcUploadHandler({ parts: 3 });
router.post(
  "/admin/upload",
  igcAdminFileUpload.single("igcFile"),
  checkIsUuidObject("userId"),
  checkIsBoolean("skipGCheck"),
  checkIsBoolean("skipManipulated"),
  checkIsBoolean("skipMidflight"),
  checkIsBoolean("skipMeta"),
  requesterMustBeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId;
      const userGliders = await userService.getGlidersById(userId);
      if (!userGliders) return res.sendStatus(NOT_FOUND);

      const validationResult = await validateIgc(req.file);

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
        igcPath: req.file?.path,
        externalId: req.externalId,
        uploadEndpoint: UPLOAD_ENDPOINT.ADMIN,
        validationResult,
      });

      const { takeoffName, result, airspaceViolation } =
        await runChecksStartCalculationsStoreFixes(flightDbObject, userId, {
          skipModifiableCheck: true,
          skipManipulatedCheck: req.body.skipManipulated === "true",
          skipMidflightCheck: req.body.skipMidflight === "true",
          skipMeta: req.body.skipMeta === "true",
        });

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

// @desc Allows an admin to rerun a flight calculation; Which includes also the location and elevation requests
// @route POST /flights/admin/rerun
// @access Only moderators and admins

router.get(
  "/admin/rerun/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flight = await service.getById(req.params.id);
      if (!flight) return res.sendStatus(NOT_FOUND);

      const { airspaceViolation } = await runChecksStartCalculationsStoreFixes(
        flight,
        null,
        // TODO: Should the recalculation really always skip all checks?
        { skipAllChecks: true }
      );

      res.json({
        airspaceViolation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Allows an admin to change any property of any flight
// @route PUT /flights/admin/change-prop/
// @access Only admins

router.put(
  "/admin/change-prop/:id",
  checkParamIsUuid("id"),
  requesterMustBeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flightStatus = await service.changeFlightProps(
        req.params.id,
        req.body
      );

      if (!flightStatus) return res.sendStatus(NOT_FOUND);

      deleteCache(CACHE_RELEVANT_KEYS);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Allows an admin to (re)fetch METAR data for a flight
// @route POST /flights/admin/fetch-metar
// @access Only moderators and admins
router.get(
  "/admin/fetch-metar/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flight = await service.getById(req.params.id);
      if (!flight) return res.sendStatus(NOT_FOUND);
      // TODO: Should there be a service that attaches the fixes directly
      // to the flight as you would expect it to happen if you query a flight?
      // e.g. getFlightWithFixes(flightId)
      const fixes = combineFixesProperties(flight.fixes);
      const data = await getMetarData(flight, fixes);
      if (!data) return res.sendStatus(NO_CONTENT);
      res.sendStatus(OK);
    } catch (error) {
      logger.error(
        "FS: METAR query error for flight " + req.params.id + ": " + error
      );
      next(error);
    }
  }
);

// @desc Allows to upload a flight via the leonardo format directly from a tracker
// @route POST /flights/leonardo

const leonardoUpload = multer({
  limits: { fieldSize: IGC_MAX_SIZE },
});
router.post(
  "/leonardo",
  uploadLimiter,
  leonardoUpload.none(),
  checkStringObjectNotEmpty("user"),
  checkStringObjectNotEmptyNoEscaping("pass"),
  checkStringObjectNotEmptyNoEscaping("IGCigcIGC"),
  checkStringObjectNotEmptyNoEscaping("igcfn"),
  checkOptionalStringObjectNotEmpty("report"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const igc: IgcFile = {
      body: req.body.IGCigcIGC,
      name: req.body.igcfn,
    };

    try {
      const user = await validate(req.body.user, req.body.pass);
      if (!user) return res.sendStatus(UNAUTHORIZED);

      // Check for users default glider
      const glider = user.gliders.find((g) => g.id == user.defaultGlider);
      if (!glider)
        return res
          .status(BAD_REQUEST)
          .send("Kein Standardgerät im Profil definiert");

      // Vars
      const userId = user.id;
      const externalId = await service.createExternalId();
      const igcPath = await persistIgcFile(externalId, igc);

      // G-Check
      const validationResult = await validateIgc(igc);
      if (isGRecordResultInvalid(res, validationResult)) {
        MailService.sendGCheckInvalidAdminMail(userId, igcPath);
        return;
      }

      // DB Object
      const flightDbObject = await service.create({
        userId,
        igcPath,
        externalId,
        uploadEndpoint: UPLOAD_ENDPOINT.LEONARDO,
        validationResult: false,
      });

      // Airspace check
      const { airspaceViolation } = await runChecksStartCalculationsStoreFixes(
        flightDbObject,
        userId
      );

      // DB
      await service.finalizeFlightSubmission({
        report: req.body.report,
        flight: flightDbObject,
        glider,
      });

      // Cache
      deleteCache(CACHE_RELEVANT_KEYS);

      // User feedback
      let message = `Der Flug wurde mit dem Gerät ${glider.brand} ${
        glider.model
      } eingereicht. Du findest deinen Flug unter ${config.get(
        "clientUrl"
      )}${config.get("clientFlight")}/${flightDbObject.externalId}.`;

      if (airspaceViolation) {
        message +=
          "\nDein Flug hatte eine Luftraumverletzung. Bitte ergänze eine Begründung in der Online-Ansicht. Wir prüfen diese so schnell wie möglich.";
        MailService.sendAirspaceViolationMail(flightDbObject);
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
  requesterMustBeLoggedIn,
  checkParamIsUuid("id"),
  checkStringObjectNoEscaping("report"),
  checkStringObjectNoEscaping("airspaceComment"),
  checkOptionalIsBoolean("onlyLogbook"),
  checkIsUuidObject("glider.id"),
  checkStringObjectNotEmpty("glider.brand"),
  checkStringObjectNotEmpty("glider.model"),
  checkStringObjectNotEmpty("glider.gliderClass.key"),
  checkOptionalIsBoolean("hikeAndFly"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const flight = await service.getById(req.params.id, true);

    if (!flight) return res.sendStatus(NOT_FOUND);

    const { report, airspaceComment, onlyLogbook, glider, hikeAndFly } =
      req.body;

    try {
      if (requesterIsNotOwner(req, res, flight.userId)) return;

      await checkIfFlightIsModifiable(flight, req.user?.id);

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
  requesterMustBeModerator,
  checkParamIsUuid("id"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const flight = await service.getById(req.params.id, true);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      await service.acceptViolation(flight);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Rejects and deletes a flight with violations
// @route PUT /flights/rejectViolation/:id
// @access Only moderator

router.put(
  "/rejectViolation/:id",
  requesterMustBeModerator,
  checkParamIsInt("id"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    const flight = await service.getByExternalId(+req.params.id);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      await service.rejectViolation(flight, req.body.message);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * This functions checks if a flight
 * - was not manipulated
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
  flightDbObject: FlightInstance,
  userId: string,
  {
    skipAllChecks = false,
    skipModifiableCheck = false,
    skipManipulatedCheck = false,
    skipMidflightCheck = false,
    skipMeta = false,
  } = {}
) {
  const fixes = extractFixes(flightDbObject);

  // TODO: This is getting too complicated. Maybe add an extra service for the rerun calculation instead of all the ifs?
  if (!skipAllChecks && !skipManipulatedCheck)
    checkIfFlightIsManipulated(fixes);
  service.attachFixRelatedTimeDataToFlight(flightDbObject, fixes);
  if (!skipAllChecks && !skipModifiableCheck)
    await checkIfFlightIsModifiable(flightDbObject, userId);
  const takeoff = await service.attachTakeoffAndLanding(flightDbObject, fixes);
  if (!skipAllChecks && !skipMidflightCheck)
    detectMidFlightIgcStart(takeoff, fixes);
  await service.checkIfFlightWasNotUploadedBefore(flightDbObject);
  const fixesDbObject = await service.storeFixesAndAddStats(
    flightDbObject,
    fixes
  );

  findAirbuddies(flightDbObject, fixesDbObject);

  if (!skipAllChecks && !skipMeta) {
    try {
      await getMetarData(flightDbObject, fixes);
    } catch (error) {
      logger.error(
        "FS: METAR query error for flight " +
          fixesDbObject.externalId +
          ": " +
          error
      );
    }
  }

  const result = await service.update(flightDbObject);

  // Run in parallel
  /** TODO: Actually airspaceViolations now contains the trackline
   * and an array of violations. Maybe check if the variable name still fits.
   * And type or JSDoc it.
   */
  const [airspaceViolations] = await Promise.all([
    service.attachElevationDataAndCheckForAirspaceViolations(flightDbObject),
    service.startResultCalculation(flightDbObject),
  ]);

  if (airspaceViolations)
    MailService.sendAirspaceViolationAdminMail(
      userId,
      flightDbObject,
      airspaceViolations.airspaceViolations
    );

  return {
    takeoffName: takeoff.name,
    result,
    airspaceViolation: airspaceViolations,
  };
}

function paramIdIsLeonardo(req: Request, res: Response) {
  if (
    !(
      typeof req.params.id == "string" &&
      req.params.id.toLowerCase() == "leonardo"
    )
  )
    return;

  return res.status(BAD_REQUEST).send(LEONARDO_ENDPOINT_MESSAGE);
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
      fileSize: IGC_MAX_SIZE,
      files: 1,
      parts,
    },
  });
}

async function persistIgcFile(externalId: number, igcFile: IgcFile) {
  const pathToFile = createFileName(externalId, igcFile.name);

  const fsPromises = fs.promises;
  logger.debug(`FC: Will write received IGC File to: ${pathToFile}`);
  await fsPromises.writeFile(pathToFile.toString(), igcFile.body);
  return pathToFile;
}

/**
 * Flight upload or modifications to an already processed flight are only allowed within the first X days after takeoff.
 * There are some exceptions from this rule:
 * - If system is not in production
 * - If the user is an admin
 * - If the env var "overruleActive" was set to true
 *
 * @param {*} flight The flight db object
 * @param {*} userId The id of the user who initiated the request
 * @throws A XccupRestrictionError if the requirements are not meet.
 */
async function checkIfFlightIsModifiable(
  flight: FlightInstance,
  userId: string
) {
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
function checkIfFlightIsManipulated(
  resultOfIgcParser: FlightFixCombined[] | string
) {
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
function detectMidFlightIgcStart(
  takeoff: FlyingSiteAttributes,
  fixes: FlightFixCombined[]
) {
  const MAX_START_ALT_OVER_TAKEOFF = 250;
  if (fixes[0]?.gpsAltitude > takeoff.elevation + MAX_START_ALT_OVER_TAKEOFF) {
    const errorMessage = `Flight starts in the middle of a flight: First fix ${fixes[0]?.gpsAltitude}m, takeoff elevation ${takeoff.elevation}m`;
    const clientMessage = `Flight starts in the middle of a flight`;

    throw new XccupHttpError(BAD_REQUEST, errorMessage, clientMessage);
  }
}

/**
 * Checks if the validation result is defined and if the result is != PASSED sends a BAD_REQUEST response to the user.
 * @param {Response} res The response object of the current request
 * @param {boolean} validationResult The result to check
 * @returns true if the result is invalid otherwise undefined
 */
function isGRecordResultInvalid(res: Response, validationResult?: FaiResponse) {
  if (!validationResult) {
    logger.warn("FC: G-Record Validation returned undefined");
  } else if (validationResult != "PASSED") {
    logger.info(
      "FC: Invalid G-Record found. Validation result: " + validationResult
    );
    res.status(BAD_REQUEST).send("Invalid G-Record");
    return true;
  }
  return false;
}

module.exports = router;
