const fs = require("fs");
const path = require("path");
const IGCParser = require("../helper/igc-parser");
const parseDMS = require("parse-dms");
const { uniq } = require("lodash");
const { TYPE } = require("../constants/flight-constants");
const {
  FIXES_AROUND_TURNPOINT,
  IGC_FIXES_RESOLUTION,
  RESOLUTION_FACTOR,
} = require("../config/igc-analyzer-config");
const logger = require("../config/logger");
const { createFileName } = require("../helper/igc-file-utils");
const { findLaunchAndLandingIndexes } = require("./IgcHelper");

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

    const igcAsPlainText = readIgcFile(flightDataObject);

    // IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with addional records in IGC-File which don't apply with IGCParser.
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

    // Remove non flight fixes
    const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);
    igcAsJson.fixes = igcAsJson.fixes.slice(
      launchAndLandingIndexes.launch,
      launchAndLandingIndexes.landing
    );

    const currentResolutionInSeconds = getResolution(igcAsJson);
    const durationInMinutes = getDuration(igcAsJson);
    const requiredResolution =
      calculateResolutionForStripIteration(durationInMinutes);
    const stripFactor = Math.ceil(
      requiredResolution / currentResolutionInSeconds
    );
    logger.debug(`IA: Will strip igc fixes by factor ${stripFactor}`);
    let igcWithReducedFixes = stripByFactor(
      stripFactor,
      igcAsPlainText,
      launchAndLandingIndexes.launch,
      launchAndLandingIndexes.landing
    );

    const { writeStream, pathToFile } = writeFile(
      flightDataObject.externalId,
      igcWithReducedFixes,
      stripFactor
    );
    writeStream.end(() => runOlc(pathToFile, flightDataObject, false));
  },

  extractFixes: (flight) => {
    logger.debug(`IA: read file from ${flight.igcPath}`);
    const igcAsPlainText = readIgcFile(flight);
    logger.debug(`IA: start parsing`);
    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

    // Detect manipulated igc files
    if (igcIsManipulated(igcAsJson)) return "manipulated";

    // Remove non flight fixes
    const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);
    igcAsJson.fixes = igcAsJson.fixes.slice(
      launchAndLandingIndexes.launch,
      launchAndLandingIndexes.landing
    );
    logger.debug(`IA: Finished parsing`);

    const currentResolution = getResolution(igcAsJson);

    let shrinkingFactor = Math.ceil(IGC_FIXES_RESOLUTION / currentResolution);

    logger.debug(
      `IA: Will shrink extracted fixes by factor ${shrinkingFactor}`
    );

    //Prevent endless loop for negative numbers
    if (shrinkingFactor < 1) shrinkingFactor = 1;

    const reducedFixes = [];
    for (let i = 0; i < igcAsJson.fixes.length; i += shrinkingFactor) {
      reducedFixes.push(extractOnlyDefinedFieldsFromFix(igcAsJson.fixes[i]));
    }
    return reducedFixes;
  },
};

// Checks if an igc files was manipulated by "MaxPunkte"

function igcIsManipulated(igc) {
  let manipulated = false;

  if (!igc.commentRecords) return false;
  igc.commentRecords.forEach((el) => {
    if (el.code === "XMP" && el.message.includes("removed by user"))
      manipulated = true;
  });
  return manipulated;
}

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

/**
 * Starts the secondd ("turnpoint") iteration.
 *
 * @param {*} resultStripIteration The results from the previous iteration.
 */
function runTurnpointIteration(resultStripIteration) {
  const igcAsPlainText = readIgcFile(resultStripIteration);

  // IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with addional records in IGC-File which don't apply with IGCParser.
  const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

  // Remove non flight fixes
  const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);

  let igcWithReducedFixes = stripAroundTurnpoints(
    igcAsPlainText,
    resultStripIteration.turnpoints,
    launchAndLandingIndexes.launch,
    launchAndLandingIndexes.landing
  );
  const { writeStream, pathToFile } = writeFile(
    resultStripIteration.externalId,
    igcWithReducedFixes,
    null
  );
  writeStream.end(() => runOlc(pathToFile, resultStripIteration, true));
}

/**
 * Determines the OLC Binary which will be used. Depends on OS and architecture.
 */
function determineOlcBinary() {
  const os = require("os");
  const platform = os.platform();
  logger.debug(`IA: Running on OS: ${platform} (${os.arch()})`);
  //TODO: This is not failsafe, but good for now;)
  if (platform.includes("win")) {
    return "olc.exe < ";
  }
  if (os.arch() === "arm64") {
    return "olc_lnx_arm < ";
  } else {
    return "olc_lnx < ";
  }
}

/**
 * Runs the OLC binary.
 *
 * @param {string} filePath
 * @param {Object} flightDataObject
 * @param {boolean} isTurnpointIteration
 */
function runOlc(filePath, flightDataObject, isTurnpointIteration) {
  const { exec } = require("child_process");
  logger.info("IA: Start OLC analysis " + filePath);
  logger.debug(`IA: CWD of proccess: ${process.cwd()}`);

  //TODO: Replace compiled app through usage of Node’s N-API
  const binary = determineOlcBinary();

  exec(
    path.resolve(__dirname, "..", "igc", binary) + filePath,
    { cwd: path.resolve(__dirname, "..") },
    function (err, data) {
      if (err) logger.error(err);
      try {
        parseOlcData(data.toString(), flightDataObject, isTurnpointIteration);
      } catch (error) {
        logger.error(
          "IA: An error occured while parsing the olc data of " +
            filePath +
            ": " +
            error
        );
      }
    }
  );
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

  logger.debug("IA: FREE DIST: " + freeDistance);
  logger.debug("IA: FLAT DIST: " + flatDistance);
  logger.debug("IA: FAI DIST: " + faiDistance);

  const freeFactor = freeDistance * flightTypeFactors.FREE;
  const flatFactor = flatDistance * flightTypeFactors.FLAT;
  const faiFactor = faiDistance * flightTypeFactors.FAI;

  logger.debug("IA: FREE Factor: " + freeFactor);
  logger.debug("IA: FLAT Factor: " + flatFactor);
  logger.debug("IA: FAI Factor: " + faiFactor);

  const result = {
    id: flightDataObject.id,
    externalId: flightDataObject.externalId,
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
    logger.debug("IA: IGC Result from turnpoint iteration: " + result);
    callback(result);
  } else {
    logger.debug("IA: IGC Result from strip iteration: " + result);
    runTurnpointIteration(result);
  }
}

/**
 * Creates an turnpoint object from a response line of the OLC binary.
 *
 * @param {string} turnpoint A line with turnpoint information
 */
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
    logger.error("IA: Could not extract turnpoint from " + turnpoint);
  }
  return result;
}

/**
 * Writes the lines of an igc file to a new file.
 *
 * @param {number} flightExternalId
 * @param {string[]} igcFileLines
 * @param {number} stripFactor
 */
function writeFile(flightExternalId, igcFileLines, stripFactor) {
  const pathToFile = createFileName(flightExternalId, null, true, stripFactor);

  logger.debug(`IA: Will start writing content to ${pathToFile}`);
  const writeStream = fs.createWriteStream(pathToFile);
  igcFileLines.forEach((value) => writeStream.write(`${value}\n`));

  writeStream.on("finish", () => {
    logger.debug(`IA: wrote all content to file ${pathToFile}`);
  });

  writeStream.on("error", (err) => {
    logger.error(
      `IA: There is an error writing the file ${pathToFile} => ${err}`
    );
  });
  return { writeStream, pathToFile };
}

/**
 * Splits the content of an igc file into lines and reduces the amount of B records (location fixes) of the given igc content.
 * B records will be reduced evenly by a factor.
 *
 * Will return the lines of a minified igc file.
 *
 * @param {*} factor The factor by which the location fixes will be reduced
 * @param {string} igcAsPlainText The whole content of an igc file as a string
 */
function stripByFactor(factor, igcAsPlainText, launch, landing) {
  const lines = igcAsPlainText.split("\n");

  const foo = removeNonFlightIgcLines(lines, launch, landing);

  const stripFactor = factor ? factor : 1;
  let reducedLines = [];
  for (let i = 0; i < foo.length; i++) {
    reducedLines.push(foo[i]);
    if (foo[i] && foo[i].startsWith("B")) {
      i = i + (stripFactor - 1);
    }
  }
  return reducedLines;
}

/**
 * This is a workaround to remove non flight fixes in plain igc files
 * @param {string[]} lines
 * @param {number} launchIndex
 * @param {number} landingIndex
 * @returns {string[]}
 */
function removeNonFlightIgcLines(lines, launchIndex, landingIndex) {
  let firstLineWithBRecord = null;
  let offset = 0;
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].startsWith("B")) {
      if (!firstLineWithBRecord) {
        firstLineWithBRecord = i;
      }
      const index = i - firstLineWithBRecord;
      if (index > launchIndex && index < landingIndex + offset) {
        newLines.push(lines[i]);
      }
    } else {
      newLines.push(lines[i]);
      // Detect non B-Records inbetween B-Records and increase offset to compensate
      if (firstLineWithBRecord && !lines[i].startsWith("B")) offset += 1;
    }
  }
  return newLines;
}

/**
 * Splits the content of an igc file into lines and reduces the amount of B records (location fixes) of the given igc content.
 * B records will only be aggregate around the turnpoints from the previous iteration.
 *
 * Will return the lines of a minified igc file.
 *
 * @param {string} igcAsPlainText The whole content of an igc file as a string
 * @param {Object[]} turnpoints An array of turnpoints from the previous "strip" iteration
 */
function stripAroundTurnpoints(
  igcAsPlainText,
  turnpoints,
  launchIndex,
  landingIndex
) {
  const rawLines = igcAsPlainText.split("\n");

  const lines = removeNonFlightIgcLines(rawLines, launchIndex, landingIndex);
  let lineIndexes = [];
  let tpIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let timeToFind = turnpoints[tpIndex].time.replace(/:/g, "");
    if (lines[i].includes("B" + timeToFind)) {
      lineIndexes.push(i);
      logger.debug("IA: Will aggregate fixes around linenumber: " + i);
      tpIndex++;
      // Decrease the index because the next turnpoint could be same as previous one (e.g takeoff is also a turnpoint on a triangle)
      i--;
      if (tpIndex == turnpoints.length) {
        logger.debug("IA: End of igc file reached");
        break;
      }
    }
  }

  // Remove duplicated indexes
  lineIndexes = uniq(lineIndexes);

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

/**
 * Determines the time resolution (in seconds) of the fixes in an igc file.
 *
 * @param {Object} igcAsJson The igc content parsed by the IgcParser.
 */
function getResolution(igcAsJson) {
  /**
   * Start with the second timestamp.
   * It occured a few times that the first and second timestamp are in the same second.
   * Maybe this is due to some corner case in the tracker. Therefore skip the first timestamp.
   */
  const referenceTimestamp = igcAsJson.fixes[1].timestamp;
  let currentResolution =
    (igcAsJson.fixes[2].timestamp - referenceTimestamp) / 1000;

  /**
   * Some few pilots have their tracker configurated with a tracking interval <1 second.
   * This is not supported by the igc definition. All these timestamps will have the same value.
   * To counter this we will search for the next timestamp which has a different value.
   */
  if (currentResolution == 0) {
    const startIndex = 3;
    // Just search in the first 20 fixes to fail fast
    for (let index = startIndex; index < 20; index++) {
      const elementTimestamp = igcAsJson.fixes[index].timestamp;
      if (elementTimestamp != referenceTimestamp) {
        currentResolution = 1 / index;
        break;
      }
    }
  }

  logger.debug(
    `The resolution of the timestamps is ${currentResolution} seconds`
  );
  return currentResolution;
}

/**
 * Calculates the comparable resolution by which the igc content will be striped in the first iteration.
 * This value is calculated by the flight duration and a constant factor defined in {@link RESOLUTION_FACTOR}.
 *
 * @param {number} durationInMinutes The duration of the flight.
 */
function calculateResolutionForStripIteration(durationInMinutes) {
  //For every hour decrease resolution by factor of seconds
  const resolution = Math.floor((durationInMinutes / 60) * RESOLUTION_FACTOR);
  logger.debug(
    `IA: The flight will be calculated with a new resolution of ${resolution} seconds`
  );
  return resolution;
}

/**
 * Determines the duration of a flight.
 *
 * @param {Object} igcAsJson The igc content parsed by the IgcParser.
 */
function getDuration(igcAsJson) {
  const sizeOfFixes = igcAsJson.fixes.length;
  const durationInMillis =
    igcAsJson.fixes[sizeOfFixes - 1].timestamp - igcAsJson.fixes[0].timestamp;
  const durationInMinutes = durationInMillis / 1000 / 60;
  logger.debug(
    `IA: The duration of the flight is ${durationInMinutes} minutes`
  );
  return durationInMinutes;
}

module.exports = IgcAnalyzer;
