const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const igcValidator = require("../igc/IgcValidator");
const path = require("path");
const fs = require("fs");
const { NOT_FOUND } = require("./Constants");
const { authToken, requesterIsNotOwner } = require("./Auth");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  checkStringObjectNotEmpty,
  checkOptionalStringObjectNotEmpty,
  validationHasErrors,
} = require("./Validation");

// @desc Retrieves all flights
// @route GET /flight/

router.get(
  "/",
  [
    query("year").optional().isInt(),
    query("site").optional().not().isEmpty().trim().escape(),
    query("type").optional().not().isEmpty().trim().escape(),
    query("rankingClass").optional().not().isEmpty().trim().escape(),
    query("limit").optional().isInt(),
    query("startDate").optional().isDate(), //e.g. 2002-07-15
    query("endDate").optional().isDate(),
  ],
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const year = req.query.year;
    const site = req.query.site;
    const type = req.query.type;
    const rankingClass = req.query.rankingClass;
    const limit = req.query.limit;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    try {
      const flights = await service.getAll(
        year,
        site,
        type,
        rankingClass,
        limit,
        null,
        startDate,
        endDate
      );
      res.json(flights);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieve a flight by id
// @route GET /flight/:id

router.get("/:id", async (req, res, next) => {
  try {
    const flight = req.flight;
    res.json(flight);
  } catch (error) {
    next(error);
  }
});

// @desc Deletes a flight by id
// @route DELETE /flight/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res, next) => {
  const flightId = req.params.id;
  try {
    const flightToDelete = req.flight;

    if (await requesterIsNotOwner(req, res, flightToDelete.userId)) return;

    const numberOfDestroyedRows = await service.delete(flightId);
    res.json(numberOfDestroyedRows);
  } catch (error) {
    next(error);
  }
});

// @desc Performs a check on the G-Record of a provided IGC-File and if valid persists the IGC-File.
// @route POST /flight/
// @access Only owner

router.post(
  "/",
  authToken,
  checkIsUuidObject("userId"),
  checkStringObjectNotEmpty("igc.name"),
  checkStringObjectNotEmpty("igc.body"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const igc = req.body.igc;
    const userId = req.body.userId;
    try {
      if (await requesterIsNotOwner(req, res, userId)) return;

      igcValidator.execute(igc).then((result) => {
        if (result == igcValidator.G_RECORD_FAILED) {
          // res.status(BAD_REQUEST).send("Invalid G-Record");
          // return;
          // TODO Current example is invalid! Repair it!
        }
        service
          .create({
            userId,
            uncheckedGRecord: result == undefined ? true : false,
            flightStatus: service.STATE_IN_PROCESS,
          })
          .then((flight) =>
            persistIgcFile(flight.id, igc).then(async (igcUrl) => {
              flight.igcUrl = igcUrl;

              service.startResultCalculation(flight);
              const takeoffName =
                await service.extractFixesAddLocationsAndDateOfFlight(flight);

              service.update(flight).then((flight) => {
                res.json({
                  flightId: flight.id,
                  takeoff: takeoffName,
                  landing: flight.landing,
                });
              });
            })
          );
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Adds futher data to a existing flight
// @route PUT /flight/:id
// @access Only owner

router.put(
  "/:id",
  authToken,
  checkStringObjectNotEmpty("glider"),
  checkOptionalStringObjectNotEmpty("report"),
  async (req, res, next) => {
    const report = req.body.report;
    const glider = req.body.glider;
    const flight = req.flight;

    try {
      if (await requesterIsNotOwner(req, res, flight.userId)) return;

      flight.report = report;
      flight.glider = glider;
      //TODO Erst nach Bekanntmachung des Glider können die Punkte für den Flug korrekt berechnet werden. Beachte evtl. ist Flugberechnung hier noch nicht abgeschlossen.
      service.update(flight).then((flight) => {
        res.json(flight.externalId);
      });
    } catch (error) {
      next(error);
    }
  }
);

// Handle not found db entry
router.param("id", async (req, res, next, id) => {
  try {
    const flight = await service.getByIdForDisplay(id);
    if (!flight) return res.sendStatus(NOT_FOUND);
    req.flight = flight;
    next();
  } catch (error) {
    next(error);
  }
});

//TODO Move to helper class "FileWriter"
async function persistIgcFile(flightId, igcFile) {
  const store = process.env.FLIGHT_STORE;
  const pathToFolder = path.join(store, flightId.toString());
  const pathToFile = path.join(pathToFolder.toString(), igcFile.name);
  const fsPromises = fs.promises;
  fs.mkdirSync(pathToFolder, { recursive: true });
  console.log(`Will write received IGC File to: ${pathToFile}`);
  await fsPromises.writeFile(pathToFile.toString(), igcFile.body);
  return pathToFile;
}

module.exports = router;
