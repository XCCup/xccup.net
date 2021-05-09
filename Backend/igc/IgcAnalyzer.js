const fs = require("fs");
const path = require("path");
const IGCParser = require("igc-parser");
const parseDMS = require("parse-dms");

const IGC_FIXES_RESOLUTION = 5;
const RESOLUTION_FACTOR = 4;
const POINTS_AROUND_CORNER = 20;
const factors = {
  fai: 5.98,
  flat: 5.46,
  free: 2.86,
};

const IgcAnalyzer = {
  startCalculation: (flight, callback) => {
    console.log("CB: ",callback);
    const flightId = flight.id.toString();
    const igcAsPlainText = readIgcFile(flightId);
    //IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with addional records in IGC-File which don't apply with IGCParser.
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });
    const currentResolutionInSeconds = getResolution(igcAsJson);
    const durationInMinutes = getDuration(igcAsJson);
    const requiredResolution = getResolutionForDuration(durationInMinutes);
    const stripFactor = requiredResolution / currentResolutionInSeconds;
    console.log(`Will strip igc fixes by factor ${stripFactor}`);
    igcWithReducedFixes = stripByFactor(stripFactor, igcAsPlainText);
    const { writeStream, pathToFile } = writeFile(
      flightId,
      igcWithReducedFixes,
      stripFactor
    );
    writeStream.end(() => runOlc(pathToFile, flightId, stripFactor == null, callback));
  },

  extractFixes: (flight) =>{
    //TODO Currently the file will be deserailized twice! 
    //1x startCalculation and 1x extractFixes
    const flightId = flight.id.toString();
    const igcAsPlainText = readIgcFile(flightId);
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });
    reducedFixes = [];
    for (i = 0; i < igcAsJson.fixes.length; i += IGC_FIXES_RESOLUTION) {
      reducedFixes.push(igcAsJson.fixes[i]);
    }
    return reducedFixes;
  }
};

function readIgcFile(flightId) {
  return fs.readFileSync(findIgcFileForFlight(flightId), "utf8");
}

function runturnpointsIteration(resultStripIteration,callback) {
  const igcAsPlainText = readIgcFile(resultStripIteration.flightId);
  igcWithReducedFixes = stripAroundturnpoints(
    igcAsPlainText,
    resultStripIteration.turnpoints
  );
  const { writeStream, pathToFile } = writeFile(
    resultStripIteration.flightId,
    igcWithReducedFixes,
    null
  );
  writeStream.end(() =>
    runOlc(pathToFile, resultStripIteration.flightId, true,callback)
  );
}

function runOlc(filePath, flightId, isTurnpointsIteration, callback) {
  const { exec } = require("child_process");
    console.log("Start OLC analysis");
    const os = require("os");
    const platform = os.platform();
    console.log("Running on OS: ", platform);
    //TODO: Replace compiled app through usage of Node’s N-API
    const command = platform.includes("win")
      ? "igc\\olc.exe < "
      : "igc/olc_lnx < ";
    exec(command + filePath, function (err, data) {
      console.log(err);
      parseOlcData(
        data.toString(),
        flightId,
        isTurnpointsIteration,
        filePath, callback
      );
  });
}

function parseOlcData(data, flightId, isTurnpointsIteration, filePath, callback) {
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

  const result = { flightId: flightId };
  result.turnpoints = [];
  let cornerStartIndex;
  if (faiPts > flatPts && faiPts > freePts) {
    result.type = "FAI";
    result.pts = faiPts;
    result.dist = faiDistance;
    cornerStartIndex = faiStartIndex + 4;
  } else if (flatPts > freePts) {
    result.pts = flatPts;
    result.type = "FLAT";
    result.dist = flatDistance;
    cornerStartIndex = flatStartIndex + 4;
  } else {
    result.pts = freePts;
    result.type = "FREE";
    result.dist = freeDistance;
    cornerStartIndex = freeStartIndex + 4;
  }
  result.turnpoints.push(extractturnpointData(dataLines[cornerStartIndex]));
  result.turnpoints.push(
    extractturnpointData(dataLines[cornerStartIndex + 1])
  );
  result.turnpoints.push(
    extractturnpointData(dataLines[cornerStartIndex + 2])
  );
  result.turnpoints.push(
    extractturnpointData(dataLines[cornerStartIndex + 3])
  );
  result.turnpoints.push(
    extractturnpointData(dataLines[cornerStartIndex + 4])
  );

  if (isTurnpointsIteration) {
    console.log("IGC Result from turnpoint iteration: ", result);
    result.igcUrl = filePath;
    console.log("CB: ",callback);
    callback(result);
  } else {
    console.log("IGC Result from strip iteration: ", result);
    runturnpointsIteration(result,callback);
  }
}

function extractturnpointData(turnpoint) {
  let result = {};
  const IGC_FIX_REGEX = /.*(\d{2}:\d{2}:\d{2}) [NS](\d*:\d*.\d*) [WE] (\d*:\d*.\d*).*/;
  const matchingResult = turnpoint.match(IGC_FIX_REGEX);
  if (matchingResult != null) {
    result.time = matchingResult[1];
    result.lat = parseDMS(matchingResult[2]);
    result.long = parseDMS(matchingResult[3]);
  } else {
    console.error("Could not extract turnpoint");
  }
  return result;
}

function writeFile(flightId, inputArray, stripFactor) {
  let name;
  if (stripFactor == null) {
    name = `turnpoints`;
  } else {
    name = `striped_by_${stripFactor}`;
  }

  const store = process.env.FLIGHT_STORE;
  const pathToFolder = path.join(store, "temp", flightId);
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
  return { writeStream, pathToFile };
}

function stripByFactor(factor, input) {
  const lines = input.split("\n");
  reducedLines = [];
  for (i = 0; i < lines.length; i++) {
    reducedLines.push(lines[i]);
    if (lines[i].startsWith("B")) {
      i = i + (factor - 1);
    }
  }
  return reducedLines;
}

function stripAroundturnpoints(input, turnpoints) {
  const lines = input.split("\n");
  let lineIndexes = [];
  let cpIndex = 0;
  for (i = 0; i < lines.length; i++) {
    let timeToFind = turnpoints[cpIndex].time.replace(/:/g, "");
    if (lines[i].includes("B" + timeToFind)) {
      lineIndexes.push(i);
      cpIndex++;
      if (cpIndex == turnpoints.length) {
        break;
      }
    }
  }

  console.log("IN: ", lineIndexes);

  reducedLines = [];
  let lineIndexesIndex = 0;
  let look = false;
  for (i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("B")) {
      reducedLines.push(lines[i]);
    } else {
      if (
        i >= lineIndexes[lineIndexesIndex] - POINTS_AROUND_CORNER &&
        i <= lineIndexes[lineIndexesIndex] + POINTS_AROUND_CORNER
      ) {
        reducedLines.push(lines[i]);
        look = true;
      } else {
        if (look) {
          lineIndexesIndex++;
          look = false;
        }
      }
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
  //Start by 1 hour with 4 seconds resolution
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
  console.log("ST: ",store);
  console.log("ID: ",flightId);
  const pathToFlightFolder = path.join(store, flightId);
  console.log(`Will look in folder ${pathToFlightFolder} for IGC-File`);
  const igcFile = fs
    .readdirSync(pathToFlightFolder)
    .filter((fn) => fn.endsWith(".igc"));
  console.log(`IGC-File ${igcFile} found`);
  return path.join(pathToFlightFolder.toString(), igcFile.toString());
}

module.exports = IgcAnalyzer;
