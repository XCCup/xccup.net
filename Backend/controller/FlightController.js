const { request, json } = require("express");
const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const path = require("path");
const { NOT_FOUND, BAD_REQUEST } = require("./Constants");
const flightService = require("../service/FlightService");
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
    writeIgcFileToDrive(result.id, igcFile).then(() => {
      service.startResultCalculation(result);
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
    flight.aircraft === null;
  console.log(`Parameter invalid: ${result}`);
  return result;
}

// router.post("/", async (req, res) => {
//   let flight = {};
//   let savedFlight;
//   let filePath;
//   new formidable.IncomingForm()
//     .parse(req)
//     .on("field", (name, field) => {
//       console.log("Field", name, field);
//       if (name == "userId") {
//         flight.userId = field;
//       }
//       if (name == "aircraft") {
//         flight.aircraft = field;
//       }
//       if (name == "report") {
//         flight.report = field;
//       }
//     })
//     .on("fileBegin", (name, file) => {
//       filePath = path.join(process.env.FLIGHT_STORE, "temp", file.name);
//       file.path = filePath;
//       console.log("Send file will be stored in: ", file.path);
//     })
//     .on("file", (name, file) => {
//       console.log("FILE");
//     })
//     .on("aborted", () => {
//       console.error("Request aborted by the user");
//     })
//     .on("error", (err) => {
//       console.error("Error", err);
//       throw err;
//     })
//     .on("end", async () => {
//       savedFlight = await service.save(flight).then(console.log("test"));
//       fileName = filePath.substring(
//         filePath.lastIndexOf(path.sep),
//         filePath.length
//       );
//       // const newfilePath = path.join(
//       //   process.env.FLIGHT_STORE,
//       //   savedFlight.id.toString(),
//       //   fileName
//       // );
//       const testPAth =
//         "C:\\Workspaces\\xccup.net\\Backend\\igc\\flights\\temp\\jojo_79km35_4h8m.igc";
//       const newfilePath = "D:\\test";
//       console.log("NFN: ", newfilePath);
//       mv(testPAth, newfilePath, function (err) {
//         // done. it tried fs.rename first, and then falls back to
//         // piping the source file to the dest file and then unlinking
//         // the source file.
//         console.log(err);
//       });
//       res.end();
//       console.log("END");
//     });
// });

module.exports = router;
