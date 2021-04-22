const fs = require("fs");
const path = require("path");
const IGCParser = require("igc-parser");

const RESOLUTION_FACTOR = 4;

const IgcAnalyzer = {
  parse: (flightId) => {
    const igcAsPlainText = fs.readFileSync(
      findIgcFileForFlight(flightId),
      "utf8"
    );
    const igcAsJson = IGCParser.parse(igcAsPlainText);
    const currentResolutionInSeconds = getResolution(igcAsJson);
    const durationInMinutes = getDuration(igcAsJson);
    const requiredResolution = getResolutionForDuration(durationInMinutes);
    const stripFactor = requiredResolution / currentResolutionInSeconds;
    console.log(`Will strip igc fixes by factor ${stripFactor}`);
    igcWithReducedFixes = strip(stripFactor, igcAsPlainText);
    writeFile(
      flightId,
      igcWithReducedFixes,
      `striped_by_${stripFactor}`,
      runOlc
    );
  },
};

function runOlc(filePath) {
  const { exec } = require("child_process");
  (() => {
    console.log("Start OLC analysis");
    const os = require("os");
    const platform = os.platform();
    console.log("Running on OS: ", platform);
    if (platform.includes("win")) {
      exec("igc\\olc.exe < " + filePath, function (err, data) {
        console.log(err);
        parseOlcData(data.toString());
      });
    } else {
      parseOlcData(null);
    }
  })();
}

function parseOlcData(data) {
  factors = {
    fai: 5.98,
    flat: 5.46,
    free: 2.86,
  };

  dataLines = data.split("\n");

  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].startsWith("OUT TYPE FREE_FLIGHT")) freeStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FREE_TRIANGLE")) flatStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FAI_TRIANGLE")) faiStartIndex = i;
  }

  const distancePrefix = "OUT FLIGHT_KM ";
  freeDistance = dataLines[freeStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  flatDistance = dataLines[flatStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  faiDistance = dataLines[faiStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");

  console.log("FREE DIST: " + freeDistance);
  console.log("FLAT DIST: " + flatDistance);
  console.log("FAI DIST: " + faiDistance);

  freePts = freeDistance * factors.free;
  flatPts = flatDistance * factors.flat;
  faiPts = faiDistance * factors.fai;

  console.log("FREE PTS: " + freePts);
  console.log("FLAT PTS: " + flatPts);
  console.log("FAI PTS: " + faiPts);

  const result = {};
  result.cornerpoints = [];
  let cornerStartIndex;
  if (faiPts > flatPts) {
    result.type = "FAI";
    result.pts = faiPts;
    result.dist = faiDistance;
    cornerStartIndex = faiStartIndex + 4;
  } else if (flatPts > freePts) {
    result.pts = flatPts;
    result.type = "FLAT";
    result.dist = flatDistance;
    cornerStartIndex = flatDistance + 4;
  } else {
    result.pts = freePts;
    result.type = "FREE";
    result.dist = freeDistance;
    cornerStartIndex = freeDistance + 4;
  }
  result.cornerpoints.push(dataLines[cornerStartIndex]);
  result.cornerpoints.push(dataLines[cornerStartIndex + 1]);
  result.cornerpoints.push(dataLines[cornerStartIndex + 2]);
  result.cornerpoints.push(dataLines[cornerStartIndex + 3]);
  result.cornerpoints.push(dataLines[cornerStartIndex + 4]);

  console.log(
    `Best type is ${result.type} with ${result.pts} pts and ${result.dist} km`
  );
  console.log("Cornerpoints:", result.cornerpoints);
  console.log("IGC Result: ", result);
}

function writeFile(flightId, inputArray, name, next) {
  const store = process.env.FLIGHT_STORE;
  const pathToFolder = path.join(__dirname, store, "temp", flightId);
  const pathToFile = path.join(pathToFolder.toString(), name + ".igc");
  fs.mkdirSync(pathToFolder, { recursive: true });
  console.log(`Will start writing content to ${pathToFile}`);
  const writeStream = fs.createWriteStream(pathToFile);
  inputArray.forEach((value) => writeStream.write(`${value}\n`));

  writeStream.on("finish", () => {
    console.log(`wrote all content to file ${pathToFile}`);
  });

  writeStream.on("error", (err) => {
    console.error(`There is an error writing the file ${pathToFile} => ${err}`);
  });

  writeStream.end(() => next(pathToFile));
  return pathToFile;
}

function strip(factor, input) {
  // // For input as JSON
  // reducedFixes = [];
  // for (i = 0; i < igcAsJson.fixes.length; i += 4) {
  //   reducedFixes.push(igcAsJson.fixes[i]);
  // }
  // return (igcAsJson.fixes = reducedFixes);

  const lines = input.split("\n");
  reducedLines = [];
  let startIndexOfFixes = 0;
  for (i = 0; i < lines.length; i++) {
    reducedLines.push(lines[i]);
    if (lines[i].startsWith("B")) {
      i = i + (factor - 1);
    }
  }
  return reducedLines;
}

function getResolution(igcAsJson) {
  const resolutionInMillis =
    igcAsJson.fixes[1].timestamp - igcAsJson.fixes[0].timestamp;
  const resolutionInSeconds = resolutionInMillis / 1000;
  console.log(
    `The resolution of the timestamps is ${resolutionInSeconds} seconds`
  );
  return resolutionInSeconds;
}

function getResolutionForDuration(durationInMinutes) {
  //For every hour decrease resolution by 4 seconds
  // Start by 1 hour with 4 seconds resolution
  resolution = Math.floor((durationInMinutes / 60) * RESOLUTION_FACTOR);
  console.log(
    `The flight will be calculated with a new resolution of ${resolution} seconds`
  );
  return resolution;
}

function getDuration(igcAsJson) {
  const sizeOfFixes = igcAsJson.fixes.length;
  const durationInMillis =
    igcAsJson.fixes[sizeOfFixes - 1].timestamp - igcAsJson.fixes[0].timestamp;
  const durationInMinutes = durationInMillis / 1000 / 60;
  console.log(`The duration of the flight is ${durationInMinutes} minutes`);
  return durationInMinutes;
}

function findIgcFileForFlight(flightId) {
  const store = process.env.FLIGHT_STORE;
  const pathToFlightFolder = path.join(__dirname, store, flightId);
  console.log(`Will look in folder ${pathToFlightFolder} for IGC-File`);
  const igcFile = fs
    .readdirSync(pathToFlightFolder)
    .filter((fn) => fn.endsWith(".igc"));
  console.log(`IGC-File ${igcFile} found`);
  return path.join(pathToFlightFolder.toString(), igcFile.toString());
}

module.exports = IgcAnalyzer;
