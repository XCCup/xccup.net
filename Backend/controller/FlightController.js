const { request, json } = require("express");
const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");
const formidable = require("formidable");
const path = require("path");
const mv = require("mv");

// @desc Retrieves all flights
// @route GET /flight/

router.get("/", async (req, res) => {
  console.log("Call controller");
  const flights = await service.getAll();
  console.log("Controller:", flights);
  res.json(flights);
});

// @desc Retrieve a flight by id
// @route GET /flight/:id

router.get("/:id", async (req, res) => {
  console.log("Call controller");
  const flights = await service.getById(req.params.id);
  if (!flights) {
    res.sendStatus(404);
    return;
  }
  console.log("Controller:", flights);
  res.json(flights);
});

router.post("/", async (req, res) => {
  let flight = {};
  let savedFlight;
  let filePath;
  new formidable.IncomingForm()
    .parse(req)
    .on("field", (name, field) => {
      console.log("Field", name, field);
      if (name == "userId") {
        flight.userId = field;
      }
      if (name == "aircraft") {
        flight.aircraft = field;
      }
      if (name == "report") {
        flight.report = field;
      }
    })
    .on("fileBegin", (name, file) => {
      filePath = path.join(process.env.FLIGHT_STORE, "temp", file.name);
      file.path = filePath;
      console.log("Send file will be stored in: ", file.path);
    })
    .on("file", (name, file) => {
      console.log("FILE");
    })
    .on("aborted", () => {
      console.error("Request aborted by the user");
    })
    .on("error", (err) => {
      console.error("Error", err);
      throw err;
    })
    .on("end", async () => {
      savedFlight = await service.save(flight).then(console.log("test"));
      fileName = filePath.substring(
        filePath.lastIndexOf(path.sep),
        filePath.length
      );
      // const newfilePath = path.join(
      //   process.env.FLIGHT_STORE,
      //   savedFlight.id.toString(),
      //   fileName
      // );
      const testPAth =
        "C:\\Workspaces\\xccup.net\\Backend\\igc\\flights\\temp\\jojo_79km35_4h8m.igc";
      const newfilePath = "D:\\test";
      console.log("NFN: ", newfilePath);
      mv(testPAth, newfilePath, function (err) {
        // done. it tried fs.rename first, and then falls back to
        // piping the source file to the dest file and then unlinking
        // the source file.
        console.log(err);
      });
      res.end();
      console.log("END");
    });
});

module.exports = router;
