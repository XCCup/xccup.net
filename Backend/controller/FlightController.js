const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const igcValidator = require("../igc/IgcValidator");
const path = require("path");
const fs = require("fs");
const { NOT_FOUND, BAD_REQUEST } = require("./Constants");
const { authToken, belongsNotToId } = require("./Auth");

// @desc Retrieves all flights
// @route GET /flight/

router.get("/", async (req, res) => {
  const flights = await service.getAll();
  res.json(flights);
});

// @desc Retrieve a flight by id
// @route GET /flight/:id

router.get("/:id", async (req, res) => {
  const flight = await service.getByIdForDisplay(req.params.id);

  if (!flight) {
    res.sendStatus(NOT_FOUND);
    return;
  }

  res.json(flight);
});

// @desc Deletes a flight by id
// @route DELETE /flight/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res) => {
  const flightId = req.params.id;
  const flightToDelete = await service.getById(flightId);

  if (!flightToDelete) {
    res.sendStatus(NOT_FOUND);
    return;
  }

  if (belongsNotToId(req, res, flightToDelete.userId)) {
    return;
  }

  const numberOfDestroyedRows = await service.delete(flightId);
  res.json(numberOfDestroyedRows);
});

// @desc Performs a check on the G-Record of a provided IGC-File and if valid persists the IGC-File.
// @route POST /flight/
// @access Only owner

router.post("/", async (req, res) => {
  //TODO Auth wieder einbauen
// router.post("/", authToken, async (req, res) => {
  const igc = req.body.igc;
  const userId = req.body.userId;

  // if (belongsNotToId(req, res, userId)) {
  //   return;
  // }

  try {
    checkParamsForIgc(igc);
  } catch (error) {
    res.status(BAD_REQUEST).send(error);
    return;
  }

  igcValidator.execute(igc).then((result) => {
    if (result == igcValidator.G_RECORD_FAILED) {
      // res.status(BAD_REQUEST).send("Invalid G-Record");
      // return;
      // TODO Current example is invalid! Repair it!
    }
    service
      .create({
        userId: userId,
        uncheckedGRecord: result == undefined ? true : false,
        flightStatus: service.STATE_IN_PROCESS,
      })
      .then((flight) =>
        persistIgcFile(flight.id, igc).then(async (igcUrl) => {
          flight.igcUrl = igcUrl;

          service.startResultCalculation(flight)
          await service.extractFixesAddLocationsAndDateOfFlight(flight);

          service.update(flight).then((flight) => {
            res.json({
              flightId: flight.id,
              takeoff: flight.takeoff,
              landing: flight.landing,
            });
          });
        })
      );
  });
});

// @desc Adds futher data to a existing flight
// @route PUT /flight/:id
// @access Only owner

router.put("/:id", authToken, async (req, res) => {
  const report = req.body.report;
  const glider = req.body.glider;
  const flightId = req.params.id;

  const flight = await service.getById(flightId);

  if (!flight) {
    res.sendStatus(NOT_FOUND);
  }

  if (belongsNotToId(req, res, flight.userId)) {
    return;
  }

  flight.report = report;
  flight.glider = glider;
  //TODO Erst nach Bekanntmachung des Glider können die Punkte für den Flug korrekt berechnet werden. Beachte evtl. ist Flugberechnung hier noch nicht abgeschlossen.
  service.update(flight).then((flight) => {
    res.json(flight.externalId);
  });
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

function checkParamsForIgc(igc) {
  const result = igc.name && igc.body;
  if (!result) {
    throw "A parameter was invalid. The parameters igc.name and igc.body are required.";
  }
}

module.exports = router;
