const fs = require("fs");
const path = require("path");
const IGCParser = require("igc-parser");
const parseDMS = require("parse-dms");

const { TYPE } = require("../constants/flight-constants");
const {
  FIXES_AROUND_TURNPOINT,
  IGC_FIXES_RESOLUTION,
  RESOLUTION_FACTOR,
} = require("../config/igc-analyzer-config");
const logger = require("../config/logger");

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
    logger.debug(`Will strip igc fixes by factor ${stripFactor}`);
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
    logger.debug(`read file from ${flight.igcPath}`);
    const igcAsPlainText = readIgcFile(flight);
    logger.debug(`start parsing`);
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });
    logger.debug(`Finished parsing`);
    const currentResolution =
      (igcAsJson.fixes[1].timestamp - igcAsJson.fixes[0].timestamp) / 1000;
    let shrinkingFactor = Math.ceil(IGC_FIXES_RESOLUTION / currentResolution);
    logger.debug(`Will shrink extracted fixes by factor ${shrinkingFactor}`);
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
  logger.debug(`Running on OS: ${platform} (${os.arch()})`);
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
  logger.info("Start OLC analysis");

  //TODO: Replace compiled app through usage of Node’s N-API
  const command = determineOlcBinary();

  exec(command + filePath, function (err, data) {
    if (err) logger.error(err);
    try {
      parseOlcData(data.toString(), flightDataObject, isTurnpointIteration);
    } catch (error) {
      logger.error(
        "An error occured while parsing the olc data of " + filePath
      );
    }
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

  logger.debug("FREE DIST: " + freeDistance);
  logger.debug("FLAT DIST: " + flatDistance);
  logger.debug("FAI DIST: " + faiDistance);

  const freeFactor = freeDistance * flightTypeFactors.FREE;
  const flatFactor = flatDistance * flightTypeFactors.FLAT;
  const faiFactor = faiDistance * flightTypeFactors.FAI;

  logger.debug("FREE Factor: " + freeFactor);
  logger.debug("FLAT Factor: " + flatFactor);
  logger.debug("FAI Factor: " + faiFactor);

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
    logger.debug("IGC Result from turnpoint iteration: ", result);
    callback(result);
  } else {
    logger.debug("IGC Result from strip iteration: ", result);
    runTurnpointIteration(result);
  }
}

function extractTurnpointData(turnpoint) {
  let result = {};
  const IGC_FIX_REGEX =
    /.*(\d{2}:\d{2}:\d{2}) [NS](\d*:\d*.\d*) [WE]\s?(\d*:\d*.\d*).*/;
  const matchingResult = turnpoint.match(IGC_FIX_REGEX);
  if (matchingResult != null) {
    result.time = matchingResult[1];
    result.lat = parseDMS(matchingResult[2]);
    result.long = parseDMS(matchingResult[3]);
  } else {
    logger.error("Could not extract turnpoint from " + turnpoint);
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
  logger.debug(`Will start writing content to ${pathToFile}`);
  const writeStream = fs.createWriteStream(pathToFile);
  inputArray.forEach((value) => writeStream.write(`${value}\n`));

  writeStream.on("finish", () => {
    logger.debug(`wrote all content to file ${pathToFile}`);
  });

  writeStream.on("error", (err) => {
    logger.error(`There is an error writing the file ${pathToFile} => ${err}`);
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
  logger.debug(
    `The resolution of the timestamps is ${resolutionInSeconds} seconds`
  );
  return resolutionInSeconds;
}

function getResolutionForDuration(durationInMinutes) {
  //For every hour decrease resolution by factor of seconds
  const resolution = Math.floor((durationInMinutes / 60) * RESOLUTION_FACTOR);
  logger.debug(
    `The flight will be calculated with a new resolution of ${resolution} seconds`
  );
  return resolution;
}

function getDuration(igcAsJson) {
  const sizeOfFixes = igcAsJson.fixes.length;
  const durationInMillis =
    igcAsJson.fixes[sizeOfFixes - 1].timestamp - igcAsJson.fixes[0].timestamp;
  const durationInMinutes = durationInMillis / 1000 / 60;
  logger.debug(`The duration of the flight is ${durationInMinutes} minutes`);
  return durationInMinutes;
}

module.exports = IgcAnalyzer;
