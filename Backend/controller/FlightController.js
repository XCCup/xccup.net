const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const path = require("path");
const {
  NOT_FOUND,
  BAD_REQUEST,
  OK,
  INTERNAL_SERVER_ERROR,
} = require("./Constants");
const fs = require("fs");

// @desc Retrieves all flights
// @route GET /flight/

router.get("/", async (req, res) => {
  console.log("Call controller");
  const flights = await service.getAll();
  res.json(flights);
});

// @desc Retrieve a flight by id
// @route GET /flight/:id

router.get("/:id", async (req, res) => {
  console.log("Call controller");
  const flight = await service.getById(req.params.id);
  if (!flight) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(flight);
});

// @desc Deletes a flight by id
// @route DELETE /flight/:id

router.delete("/:id", async (req, res) => {
  console.log("Call controller");
  const numberOfDestroyedRows = await service.delete(req.params.id);
  if (!numberOfDestroyedRows) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(numberOfDestroyedRows);
});

// @desc Saves a new flight to the database
// @route POST /flight/

router.post("/", async (req, res) => {
  const newFlight = req.body;
  newFlight.flightStatus = "In Bearbeitung";

  if (areRequiredFlightParamsInvalid(newFlight)) {
    res.sendStatus(BAD_REQUEST);
    return;
  }

  const igcFile = newFlight.igc;
  delete newFlight.igc;

  service.save(newFlight).then((result) => {
    writeIgcFileToDrive(result.id, igcFile)
      .then(() => {
        service.startResultCalculation(result);
        // Return a hard coded flight id for development. Should be the real flight id in future.
        res.status(200).send("40");
      })
      .catch((error) => {
        res.status(INTERNAL_SERVER_ERROR).send(error.message);
      });
  });
});

async function writeIgcFileToDrive(flightId, igcFile) {
  const store = process.env.FLIGHT_STORE;
  const pathToFolder = path.join(store, flightId.toString());
  const pathToFile = path.join(pathToFolder.toString(), igcFile.name);
  const fsPromises = fs.promises;
  fs.mkdirSync(pathToFolder, { recursive: true });
  console.log(`Will write received IGC File to: ${pathToFile}`);
  await fsPromises.writeFile(pathToFile.toString(), igcFile.body);
}

function areRequiredFlightParamsInvalid(flight) {
  const result =
    flight.pilotId === null ||
    flight.igc.name === null ||
    flight.igc.body === null ||
    flight.glider === null;
  console.log(`Parameter invalid: ${result}`);
  return result;
}

module.exports = router;
