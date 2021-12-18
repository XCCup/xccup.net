const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const { isAdmin } = require("../service/UserService");
const igcValidator = require("../igc/IgcValidator");
const IgcAnalyzer = require("../igc/IgcAnalyzer");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const {
  NOT_FOUND,
  OK,
  BAD_REQUEST,
} = require("../constants/http-status-constants");
const {
  STATE,
  DAYS_FLIGHT_CHANGEABLE,
} = require("../constants/flight-constants");
const {
  authToken,
  requesterIsNotOwner,
  requesterIsNotModerator,
} = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const logger = require("../config/logger");
const {
  checkStringObjectNotEmpty,
  checkStringObject,
  checkParamIsInt,
  checkParamIsUuid,
  checkIsUuidObject,
  validationHasErrors,
  checkOptionalIsBoolean,
  queryOptionalColumnExistsInModel,
} = require("./Validation");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const { createFileName } = require("../helper/igc-file-utils");
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
    query("type").optional().not().isEmpty().trim().escape(),
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
      unchecked: true,
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve a flight by id
// @route GET /flights/:id

router.get("/:id", checkParamIsInt("id"), async (req, res, next) => {
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

    return res.download(fullfilepath);
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

      const numberOfDestroyedRows = await service.delete(flight.id);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Performs a check on the G-Record of a provided IGC-File and if valid persists the IGC-File.
// @route POST /flights/
// @access Only owner

router.post(
  "/",
  uploadLimiter,
  authToken,
  checkStringObjectNotEmpty("igc.name"),
  checkStringObjectNotEmpty("igc.body"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const igc = req.body.igc;
    const userId = req.user.id;
    try {
      const validationResult = await igcValidator.execute(igc);
      if (!validationResult) {
        logger.warn("FC: G-Record Validation returned undefined");
      } else if (validationResult != igcValidator.G_RECORD_PASSED) {
        logger.info(
          "FC: Invalid G-Record found. Validation result: " + validationResult
        );
        return res.status(BAD_REQUEST).send("Invalid G-Record");
      }

      const flightDbObject = await service.create({
        userId,
        uncheckedGRecord: validationResult == undefined ? true : false,
        flightStatus: STATE.IN_PROCESS,
      });

      flightDbObject.igcPath = await persistIgcFile(
        flightDbObject.externalId,
        igc
      );

      const fixes = IgcAnalyzer.extractFixes(flightDbObject);
      service.attachFixRelatedTimeData(flightDbObject, fixes);

      await checkIfFlightIsModifiable(flightDbObject, userId);

      const takeoffName =
        await service.storeFixesAndAddFurtherInformationToFlight(
          flightDbObject,
          fixes
        );

      service.startResultCalculation(flightDbObject);

      const result = await service.update(flightDbObject);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json({
        flightId: result.id,
        externalId: result.externalId,
        takeoff: takeoffName,
        landing: result.landing,
      });
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
  checkStringObject("report"),
  checkStringObject("airspaceReport"),
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

    const { report, airspaceReport, onlyLogbook, glider, hikeAndFly } =
      req.body;

    try {
      if (await requesterIsNotOwner(req, res, flight.userId)) return;

      await checkIfFlightIsModifiable(flight, req.user.id);

      const result = await service.finalizeFlightSubmission(
        flight,
        report,
        airspaceReport,
        onlyLogbook,
        glider,
        hikeAndFly
      );

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json({
        flightPoints: result[1][0].flightPoints,
        flightStatus: result[1][0].flightStatus,
      });
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

async function persistIgcFile(externalId, igcFile) {
  const pathToFile = createFileName(externalId, igcFile.name);

  const fsPromises = fs.promises;
  logger.debug(`FC: Will write received IGC File to: ${pathToFile}`);
  await fsPromises.writeFile(pathToFile.toString(), igcFile.body);
  return pathToFile;
}

async function checkIfFlightIsModifiable(flight, userId) {
  const { XccupRestrictionError } = require("../helper/ErrorHandler");

  // Allow flight uploads which are older than 14 days when not in production (Needed for testing)
  const overwriteIfInProcessAndNotProduction =
    flight.flightStatus == STATE.IN_PROCESS &&
    process.env.NODE_ENV !== "production";

  const flightIsYoungerThanThreshold = moment(flight.takeoffTime)
    .add(DAYS_FLIGHT_CHANGEABLE, "days")
    .isAfter(moment());

  if (overwriteIfInProcessAndNotProduction) return;
  if (flightIsYoungerThanThreshold) return;
  if (await isAdmin(userId)) return;

  throw new XccupRestrictionError(
    `It's not possible to change a flight later than ${DAYS_FLIGHT_CHANGEABLE} days after takeoff`
  );
}

module.exports = router;
