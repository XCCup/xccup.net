const fs = require("fs");
const path = require("path");
const IGCParser = require("igc-parser");
const parseDMS = require("parse-dms");

const { TYPE } = require("../constants/flight-constants");

/**
 * The resolution in seconds with which fixes are stored to the db
 */
const IGC_FIXES_RESOLUTION = 5;
/**
 * The factor by which the fixes within a igcFile will be parsed for the first iteration of the olc algorithm
 * Starting with:
 * * 1h = RESOLUTION_FACTOR
 * * 2h = 2 x RESOLUTION_FACTOR
 * * nh = n x RESOLUTION_FACTOR
 */
const RESOLUTION_FACTOR = 4;
/**
 * The amount of fixes around a turnpoint which will be considered for the second iteration of the olc algorithm
 */
const FIXES_AROUND_TURNPOINT = 20;

let flightTypeFactors;
let callback;

const IgcAnalyzer = {
  /**
   * This function determines
   * * flightType
   * * flightDistance
   * * turnpoints (of a the best task (FREE, FLAT or FAI))
   *
   * of a given flight.
   *
   * Before calling this function, the corresponing igcFile has to be stored to the disk.
   * The file must be within a location defined by the global var FLIGHT_STORE and a folder corresponing to the flightId.
   *
   * How does it work:
   *
   * The algorithm is based on the original OLC algorithm by Dietrich Münchmeyer.
   *
   * This wayfinding problem has a complexity of O(n^5).
   * With resolutions for fixes of 1s and longer flights, this will result in an explosion of calculations.
   *
   * To minimize the problem the OLC algorithm will be run in two iterations.
   * * First iteration: Minimize resolution of the igcFile in general and determine the turnpoints for each task (FREE, FLAT, FAI).
   * * Second iteration: Dismiss all fixes of the original igcFile except a bubble of fixes around the turnpoints of the best task from the first iteration.
   *
   * @param {Flight} flightDataObject The flight to analyse
   * @param {Object} flightTypeFactorParameter The factors for the flightTypes (FREE, FLAT, FAI)
   * @param {Function} callbackFunction The function which will be called when the analyse finishes. This function will receive an result object of type Flight.
   */
  startCalculation: async (
    flightDataObject,
    flightTypeFactorParameter,
    callbackFunction
  ) => {
    flightTypeFactors = flightTypeFactorParameter;
    callback = callbackFunction;

    const flightId = flightDataObject.id.toString();
    const igcAsPlainText = readIgcFile(flightDataObject);

    //IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with addional records in IGC-File which don't apply with IGCParser.
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });
    const currentResolutionInSeconds = getResolution(igcAsJson);
    const durationInMinutes = getDuration(igcAsJson);
    const requiredResolution = getResolutionForDuration(durationInMinutes);
    const stripFactor = Math.ceil(
      requiredResolution / currentResolutionInSeconds
    );
    console.log(`Will strip igc fixes by factor ${stripFactor}`);
    let igcWithReducedFixes = stripByFactor(stripFactor, igcAsPlainText);
    const { writeStream, pathToFile } = writeFile(
      flightId,
      igcWithReducedFixes,
      stripFactor
    );
    writeStream.end(() =>
      runOlc(pathToFile, flightDataObject, stripFactor == null)
    );
  },

  extractFixes: (flight) => {
    //TODO Currently the file will be deserailized twice!
    //1x startCalculation and 1x extractFixes
    console.log(`read file from ${flight.igcPath}`);
    const igcAsPlainText = readIgcFile(flight);
    console.log(`start parsing`);
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });
    console.log(`Finished parsing`);
    const currentResolution =
      (igcAsJson.fixes[1].timestamp - igcAsJson.fixes[0].timestamp) / 1000;
    let shrinkingFactor = Math.ceil(IGC_FIXES_RESOLUTION / currentResolution);
    console.log(`Will shrink extracted fixes by factor ${shrinkingFactor}`);
    let reducedFixes = [];
    if (shrinkingFactor < 1) {
      //Prevent endless loop for negative numbers
      shrinkingFactor = 1;
    }
    for (let i = 0; i < igcAsJson.fixes.length; i += shrinkingFactor) {
      reducedFixes.push(extractOnlyDefinedFieldsFromFix(igcAsJson.fixes[i]));
    }
    return reducedFixes;
  },
};

function extractOnlyDefinedFieldsFromFix(fix) {
  return {
    timestamp: fix.timestamp,
    time: fix.time,
    latitude: fix.latitude,
    longitude: fix.longitude,
    pressureAltitude: fix.pressureAltitude,
    gpsAltitude: fix.gpsAltitude,
  };
}

function readIgcFile(flight) {
  return fs.readFileSync(flight.igcPath.toString(), "utf8");
}

function runTurnpointIteration(resultStripIteration) {
  const igcAsPlainText = readIgcFile(resultStripIteration);
  let igcWithReducedFixes = stripAroundturnpoints(
    igcAsPlainText,
    resultStripIteration.turnpoints
  );
  const { writeStream, pathToFile } = writeFile(
    resultStripIteration.id,
    igcWithReducedFixes,
    null
  );
  writeStream.end(() => runOlc(pathToFile, resultStripIteration, true));
}
function determineOlcBinary() {
  const os = require("os");
  const platform = os.platform();
  console.log(`Running on OS: ${platform} (${os.arch()})`);
  //TODO: This is not failsafe, but good for now;)
  if (platform.includes("win")) {
    return "igc\\olc.exe < ";
  }
  if (os.arch() === "arm64") {
    return "igc/olc_lnx_arm < ";
  } else {
    return "igc/olc_lnx < ";
  }
}

function runOlc(filePath, flightDataObject, isTurnpointIteration) {
  const { exec } = require("child_process");
  console.log("Start OLC analysis");

  //TODO: Replace compiled app through usage of Node’s N-API
  const command = determineOlcBinary();

  exec(command + filePath, function (err, data) {
    if (err) console.log(err);
    parseOlcData(data.toString(), flightDataObject, isTurnpointIteration);
  });
}

function parseOlcData(data, flightDataObject, isTurnpointsIteration) {
  const dataLines = data.split("\n");

  let freeStartIndex;
  let flatStartIndex;
  let faiStartIndex;
  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].startsWith("OUT TYPE FREE_FLIGHT")) freeStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FREE_TRIANGLE")) flatStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FAI_TRIANGLE")) faiStartIndex = i;
  }

  const distancePrefix = "OUT FLIGHT_KM ";
  let freeDistance = dataLines[freeStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  let flatDistance = dataLines[flatStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  let faiDistance = dataLines[faiStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");

  console.log("FREE DIST: " + freeDistance);
  console.log("FLAT DIST: " + flatDistance);
  console.log("FAI DIST: " + faiDistance);

  const freeFactor = freeDistance * flightTypeFactors.FREE;
  const flatFactor = flatDistance * flightTypeFactors.FLAT;
  const faiFactor = faiDistance * flightTypeFactors.FAI;

  console.log("FREE Factor: " + freeFactor);
  console.log("FLAT Factor: " + flatFactor);
  console.log("FAI Factor: " + faiFactor);

  const result = {
    id: flightDataObject.id,
    turnpoints: [],
    igcPath: flightDataObject.igcPath,
  };
  let cornerStartIndex;
  if (faiFactor > flatFactor && faiFactor > freeFactor) {
    result.type = TYPE.FAI;
    result.dist = faiDistance;
    cornerStartIndex = faiStartIndex + 4;
  } else if (flatFactor > freeFactor) {
    result.type = TYPE.FLAT;
    result.dist = flatDistance;
    cornerStartIndex = flatStartIndex + 4;
  } else {
    result.type = TYPE.FREE;
    result.dist = freeDistance;
    cornerStartIndex = freeStartIndex + 4;
  }
  result.turnpoints.push(extractTurnpointData(dataLines[cornerStartIndex]));
  result.turnpoints.push(extractTurnpointData(dataLines[cornerStartIndex + 1]));
  result.turnpoints.push(extractTurnpointData(dataLines[cornerStartIndex + 2]));
  result.turnpoints.push(extractTurnpointData(dataLines[cornerStartIndex + 3]));
  result.turnpoints.push(extractTurnpointData(dataLines[cornerStartIndex + 4]));

  if (isTurnpointsIteration) {
    console.log("IGC Result from turnpoint iteration: ", result);
    callback(result);
  } else {
    console.log("IGC Result from strip iteration: ", result);
    runTurnpointIteration(result);
  }
}

function extractTurnpointData(turnpoint) {
  let result = {};
  const IGC_FIX_REGEX =
    /.*(\d{2}:\d{2}:\d{2}) [NS](\d*:\d*.\d*) [WE] (\d*:\d*.\d*).*/;
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
  let reducedLines = [];
  for (let i = 0; i < lines.length; i++) {
    reducedLines.push(lines[i]);
    if (lines[i] && lines[i].startsWith("B")) {
      i = i + (factor - 1);
    }
  }
  return reducedLines;
}

function stripAroundturnpoints(input, turnpoints) {
  const lines = input.split("\n");
  let lineIndexes = [];
  let tpIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let timeToFind = turnpoints[tpIndex].time.replace(/:/g, "");
    if (lines[i].includes("B" + timeToFind)) {
      lineIndexes.push(i);
      tpIndex++;
      if (tpIndex == turnpoints.length) {
        break;
      }
    }
  }

  let reducedLines = [];
  let lineIndexesIndex = 0;
  let look = false;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("B")) {
      reducedLines.push(lines[i]);
    } else {
      if (
        i >= lineIndexes[lineIndexesIndex] - FIXES_AROUND_TURNPOINT &&
        i <= lineIndexes[lineIndexesIndex] + FIXES_AROUND_TURNPOINT
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
  //For every hour decrease resolution by factor of seconds
  const resolution = Math.floor((durationInMinutes / 60) * RESOLUTION_FACTOR);
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

module.exports = IgcAnalyzer;
