const fs = require("fs");
const { copyFile } = require("fs/promises");
const path = require("path");
const IgcAnalyzer = require("../igc/IgcAnalyzer");
const FlightStatsCalculator = require("../igc/FlightStatsCalculator");
const { createFileName } = require("../helper/igc-file-utils");
const { v4: uuidv4 } = require("uuid");
const { sleep } = require("../helper/Utils");

const folderPath = process.argv[2];
const year = process.argv[3];
const flightsAll = require("../import/flightsImport2014.json");
const flights = flightsAll.filter((f) => {
  if (!f?.takeoffTime) return;
  return new Date(f.takeoffTime).getFullYear() == year;
});

let isLastFlight = false;

const directoryPath = path.join(folderPath, year, "IGC");
//passsing directoryPath and callback function
fs.readdir(directoryPath, async function (err, files) {
  //handling error
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  process.env.SERVER_DATA_PATH = "./data";

  // create folder for fixes
  const fixesDir = path.join("fixes", year.toString());
  fs.mkdirSync(fixesDir, { recursive: true });

  for (let index = 0; index < files.length; index++) {
    try {
      const file = files[index];
      console.log("Start parsing for file " + file + " is index: " + index);
      const found = flights.find((flight) => flight.igcPath?.includes(file));

      if (found) {
        await sleep(4000);
        // Move igc file
        const srcPath = path.join(directoryPath, file);
        const desPath = createFileName(
          found.externalId,
          file,
          null,
          null,
          year
        );
        await copyFile(srcPath, desPath);

        // Extract fixes and store to disk
        found.igcPath = desPath;

        const fixes = IgcAnalyzer.extractFixes(found);

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
        found.flightStats = {
          ...found.flightStats,
          minHeightBaro,
          maxHeightBaro,
          minHeightGps,
          maxHeightGps,
          maxSink,
          maxClimb,
          maxSpeed,
        };

        const fixesOfFlight = {
          id: uuidv4(),
          flightId: found.id,
          geom: createGeometry(fixes),
          timeAndHeights: extractTimeAndHeights(fixes),
          stats: fixesStats,
        };

        fs.writeFile(
          path.join(fixesDir, `${found.externalId}_${file}_fixes.json`),
          JSON.stringify(fixesOfFlight, null, 2),
          "utf8",
          (err) => {
            if (err) console.log(err);
          }
        );

        // Analyze and retrieve turnpoints

        if (index == flights.length - 1) isLastFlight = true;

        IgcAnalyzer.startCalculation(
          found,
          { FREE: 1, FLAT: 1.5, FAI: 2 },
          saveTurnpoints
        );
      } else {
        // console.log("No flight found for igc " + file);
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.log("+++++++++++++++++++++++++++++");
  console.log("Finished parsing all igc data");
});

function saveTurnpoints(res) {
  const found = flights.find((f) => f.id == res.id);
  found.igcPath = res.igcPath;
  found.flightTurnpoints = res.turnpoints;

  if (isLastFlight) {
    console.log("Write turnpoints file");
    fs.writeFile(
      `${year}_turnpoints.json`,
      JSON.stringify(flightsAll, null, 2),
      "utf8",
      (err) => {
        if (err) console.log(err);
      }
    );
  }
}

function createGeometry(fixes) {
  const coordinates = [];
  fixes.forEach((fix) => {
    coordinates.push([fix.longitude, fix.latitude]);
  });
  return {
    type: "LineString",
    coordinates,
  };
}

function extractTimeAndHeights(fixes) {
  const times = [];
  fixes.forEach((fix) => {
    times.push({
      timestamp: fix.timestamp,
      time: fix.time,
      pressureAltitude: fix.pressureAltitude,
      gpsAltitude: fix.gpsAltitude,
      elevation: fix.elevation,
    });
  });
  return times;
}
