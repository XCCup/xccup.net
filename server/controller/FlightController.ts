import express, { NextFunction, Request, Response } from "express";
import service from "../service/FlightService";
import { isAdmin, validate } from "../service/UserService";
import igcValidator from "../igc/IgcValidator";
import IgcAnalyzer from "../igc/IgcAnalyzer";
import path from "path";
import moment from "moment";
import fs from "fs";
import {
  NOT_FOUND,
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
} from "../constants/http-status-constants";
import { STATE, IGC_STORE } from "../constants/flight-constants";
import {
  authToken,
  requesterIsNotOwner,
  requesterIsNotModerator,
  requesterIsNotAdmin,
} from "./Auth";
import createRateLimiter from "./api-protection";
import { query } from "express-validator";
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
} from "./Validation";
import { getCache, setCache, deleteCache } from "./CacheManager";
import { createFileName } from "../helper/igc-file-utils";

import multer from "multer";
import { getCurrentYear } from "../helper/Utils";
import userService from "../service/UserService";

const router = express.Router();

const config = require("../config/env-config").default;

const CACHE_RELEVANT_KEYS = ["home", "results", "flights"];
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
  async (req: Request, res: Response, next: NextFunction) => {
    if (validationHasErrors(req, res)) return;

    try {
      const value = getCache(req);
      if (value) return res.json(value);
      // @ts-ignore TODO: Type this stronger
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
    // @ts-ignore TODO: Type this stronger
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
    // @ts-ignore TODO: Type this stronger
    const flights = await service.getAll({
      includeUnchecked: true,
      userId: req.user?.id,
      sort: [req.query.sortCol, req.query.sortOrder],
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve a flight by id
// @route GET /flights/:id

router.get(
  "/:id",
  checkParamIsInt("id"),
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res) || paramIdIsLeonardo(req, res)) return;

    const flight = await service.getByExternalId(req.params?.id);
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

router.get("/igc/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params?.id;

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
    const flightId = req.params?.id;

    const flight = await service.getByExternalId(flightId);
    if (!flight) return res.sendStatus(NOT_FOUND);

    try {
      if ((await requesterIsNotOwner(req, res, flight.userId)) || !req.user?.id)
        return;

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
    if (!req.user?.id) return;
    const userId = req.user.id;

    try {
      if (!req.file) return;
      const validationResult = await igcValidator.execute(req.file);
      if (isGRecordResultInvalid(res, validationResult)) return;

      const flightDbObject = await service.create({
        userId,
        igcPath: req.file.path,
        externalId: req.externalId,
        validationResult,
      });

      const fixes = IgcAnalyzer.extractFixes(flightDbObject);

      service.attachFixRelatedTimeDataToFlight(flightDbObject, fixes);

      await checkIfFlightIsModifiable(flightDbObject, userId);

      const takeoffName =
        await service.storeFixesAndAddFurtherInformationToFlight(
          flightDbObject,
          fixes
        );

      const result = await service.update(flightDbObject);

      service.startResultCalculation(flightDbObject);

      const airspaceViolation =
        await service.attachElevationDataAndCheckForAirspaceViolations(
          flightDbObject
        );

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

// @desc Allows a admin to upload a flight for a user; Admins are also able to upload older flights.
// @route POST /flights/admin/upload
// @access Only moderators and admins

const igcAdminFileUpload = createMulterIgcUploadHandler({ parts: 2 });
router.post(
  "/admin/upload",
  igcAdminFileUpload.single("igcFile"),
  checkIsUuidObject("userId"),
  authToken,
  async (req, res, next) => {
    try {
      if (!req.file) return;

      if (await requesterIsNotAdmin(req, res)) return;

      const userId = req.body.userId;
      const userGliders = await userService.getGlidersById(userId);
      if (!userGliders) return res.sendStatus(NOT_FOUND);

      const validationResult = await igcValidator.execute(req.file);
      if (isGRecordResultInvalid(res, validationResult)) return;

      const flightDbObject = await service.create({
        userId,
        igcPath: req.file.path,
        externalId: req.externalId,
        validationResult,
      });

      const fixes = IgcAnalyzer.extractFixes(flightDbObject);

      service.attachFixRelatedTimeDataToFlight(flightDbObject, fixes);

      const takeoffName =
        await service.storeFixesAndAddFurtherInformationToFlight(
          flightDbObject,
          fixes
        );

      const result = await service.update(flightDbObject);

      service.startResultCalculation(flightDbObject);

      const glider = userGliders.gliders.find(
        (g) => g.id == userGliders.defaultGlider
      );
      if (!glider)
        return res
          .status(BAD_REQUEST)
          .send("No default glider configured in profile");

      service.finalizeFlightSubmission({ flight: flightDbObject, glider });

      const airspaceViolation =
        await service.attachElevationDataAndCheckForAirspaceViolations(
          flightDbObject
        );

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

      const flight = await service.getById(req.params?.id);
      if (!flight) return res.sendStatus(NOT_FOUND);

      service.startResultCalculation(flight);

      const airspaceViolation =
        await service.attachElevationDataAndCheckForAirspaceViolations(flight);

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
        return res
          .status(BAD_REQUEST)
          .send("No default glider configured in profile");

      // const validationResult = await igcValidator.execute(igc);
      // if (isGRecordResultInvalid(res, validationResult)) return;

      const flightDbObject = await service.create({
        userId: user.id,
        externalId: await service.createExternalId(),
        validationResult: false,
      });

      flightDbObject.igcPath = await persistIgcFile(
        flightDbObject.externalId,
        igc
      );

      const fixes = IgcAnalyzer.extractFixes(flightDbObject);
      service.attachFixRelatedTimeDataToFlight(flightDbObject, fixes);

      await checkIfFlightIsModifiable(flightDbObject, user.id);

      await service.storeFixesAndAddFurtherInformationToFlight(
        flightDbObject,
        fixes
      );

      service.attachElevationDataAndCheckForAirspaceViolations(flightDbObject, {
        sendMail: true,
      });

      service.startResultCalculation(flightDbObject);

      await service.finalizeFlightSubmission({
        flight: flightDbObject,
        glider,
      });

      deleteCache(CACHE_RELEVANT_KEYS);

      res
        .status(OK)
        .send(
          `Der Flug wurde mit dem Gerät ${glider.brand} ${glider.model} eingereicht`
        );
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

    const flight = await service.getById(req.params?.id, true);

    if (!flight) return res.sendStatus(NOT_FOUND);

    const { report, airspaceComment, onlyLogbook, glider, hikeAndFly } =
      req.body;

    try {
      if ((await requesterIsNotOwner(req, res, flight.userId)) || !req.user?.id)
        return;

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

    const flight = await service.getById(req.params?.id, true);
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
// TODO: function name implies it would return a boolean
function paramIdIsLeonardo(req: Request, res: Response) {
  if (
    !(
      typeof req.params?.id == "string" &&
      req.params?.id.toLowerCase() == "leonardo"
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
  const dataPath = process.env.SERVER_DATA_PATH;
  if (!dataPath) throw new Error("SERVER_DATA_PATH not set");

  const igcStorage = multer.diskStorage({
    destination: path
      .join(dataPath, IGC_STORE, getCurrentYear().toString())
      .toString(),
    filename: function (req: Request, file, cb) {
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
// TODO: Description
async function persistIgcFile(externalId: number, igcFile) {
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
async function checkIfFlightIsModifiable(flight, userId: string) {
  const { XccupRestrictionError } = require("../helper/ErrorHandler");
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
 * Checks if the validation result is defined and if the result is != PASSED sends a BAD_REQUEST response to the user.
 * @param {*} res The response object of the current request
 * @param {*} validationResult The result to check
 * @returns true if the result is invalid otherwise undefined
 */
// TODO: Why check if the outcome of a checking function is correct? 🍝🍝🍝
function isGRecordResultInvalid(res: Response, validationResult: string) {
  if (!validationResult) {
    logger.warn("FC: G-Record Validation returned undefined");
  } else if (validationResult != igcValidator.G_RECORD_PASSED) {
    logger.info(
      "FC: Invalid G-Record found. Validation result: " + validationResult
    );
    res.status(BAD_REQUEST).send("Invalid G-Record");
    return true;
  }
}

module.exports = router;
