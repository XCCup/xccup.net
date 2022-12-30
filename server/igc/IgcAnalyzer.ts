import { exec } from "child_process";
import util from "util";
import path from "path";
import { TYPE } from "../constants/flight-constants";
import { FlightTurnpoint } from "../db/models/Flight";
// @ts-ignore
import parseDMS from "parse-dms";
import { FlightTypeFactors } from "../db/models/SeasonDetail";
import { BRecord, IGCFile } from "../helper/igc-parser";
import fs from "fs";
import IGCParser from "../helper/igc-parser";
// @ts-ignore
import parseDMS from "parse-dms";
import { uniq } from "lodash";
import logger from "../config/logger";
import { createFileName } from "../helper/igc-file-utils";

import {
  FIXES_AROUND_TURNPOINT,
  IGC_FIXES_RESOLUTION,
  RESOLUTION_FACTOR,
} from "../config/igc-analyzer-config";
import { findLaunchAndLandingIndexes } from "../igc/FindLaunchAndLanding";
import { XccupHttpError } from "../helper/ErrorHandler";
import { BAD_REQUEST } from "../constants/http-status-constants";

export interface OLCResult {
  turnpoints: FlightTurnpoint[];
  dist: string;
  type: TYPE;
}

/**
 * This function determines
 * * flightType
 * * flightDistance
 * * turnpoints (of the best task (FREE, FLAT or FAI))
 *
 * of a given flight.
 *
 * Before calling this function, the corresponding igcFile has to be stored to the disk.
 * The file must be within a location defined by the global var FLIGHT_STORE and a folder corresponding to the flightId.
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
 */
export async function calculateFlightResult(
  igcPath: string,
  externalId: number,
  flightTypeFactors: FlightTypeFactors
) {
  const igcContent = readIgcFile(igcPath);
  if (!igcContent) throw new Error("No igc content");

  // IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with additional records in IGC-File which don't apply with IGCParser.
  const igcAsJson = IGCParser.parse(igcContent, { lenient: true });

  // Remove non flight fixes
  const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);
  igcAsJson.fixes = igcAsJson.fixes.slice(
    launchAndLandingIndexes.launch,
    launchAndLandingIndexes.landing
  );

  const currentResolutionInSeconds = getResolution(igcAsJson);
  const durationInMinutes = getFlightDuration(igcAsJson);
  const requiredResolution = calculateResolutionForReduction(durationInMinutes);
  const reduceFactor = Math.ceil(
    requiredResolution / currentResolutionInSeconds
  );
  logger.debug(`IA: Will strip igc fixes by factor ${reduceFactor}`);
  const reducedFixes = reduceByFactor(
    reduceFactor,
    igcContent,
    launchAndLandingIndexes.launch,
    launchAndLandingIndexes.landing
  );

  const pathToReducedIgc = await writeIgcToFile(
    externalId,
    reducedFixes,
    reduceFactor
  );

  const roughResult = await runOlc(pathToReducedIgc, flightTypeFactors);

  if (!roughResult) throw new Error("First iteration of igc failed");
  logger.debug("IA: Result for rough igc: ", JSON.stringify(roughResult));

  const strippedIgc = runTurnpointIteration(roughResult, igcPath);
  if (!strippedIgc) throw new Error("Reducing igc to turnpoints failed");

  const pathToStrippedIgc = await writeIgcToFile(externalId, strippedIgc);

  const res = await runOlc(pathToStrippedIgc, flightTypeFactors);
  if (!res) throw new Error("Second iteration of igc failed");
  logger.debug(
    "IA: Result for precise flight turnpoints: ",
    JSON.stringify(roughResult)
  );
  return res;
}

export function extractFixes(igcPath?: string) {
  logger.debug(`IA: read file from ${igcPath}`);
  const igcAsPlainText = readIgcFile(igcPath ?? "");
  logger.debug(`IA: start parsing`);
  try {
    if (!igcAsPlainText) throw new Error("IA: No igc content");

    const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

    // Detect manipulated igc files
    if (igcIsManipulated(igcAsJson)) {
      let errorMessage = "Manipulated IGC-File";

      throw new XccupHttpError(BAD_REQUEST, errorMessage, errorMessage);
    }

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
  } catch (error: any) {
    const errorMessage = "Error parsing IGC File " + error?.message;
    throw new XccupHttpError(BAD_REQUEST, errorMessage, errorMessage);
  }
}

/**
 * Checks if an igc file was manipulated by "MaxPunkte"
 */
function igcIsManipulated(igc: IGCFile) {
  if (!igc.commentRecords) return false;
  let manipulated = false;
  igc.commentRecords.forEach((el) => {
    if (el.code === "XMP" && el.message.includes("removed by user"))
      return (manipulated = true);
  });

  return manipulated;
}

function extractOnlyDefinedFieldsFromFix(fix: BRecord) {
  return {
    timestamp: fix.timestamp,
    time: fix.time,
    latitude: fix.latitude,
    longitude: fix.longitude,
    pressureAltitude: fix.pressureAltitude,
    gpsAltitude: fix.gpsAltitude,
  };
}

function readIgcFile(path: string) {
  return fs.readFileSync(path.toString(), "utf8");
}

/**
 * Starts the second ("turnpoint") iteration.
 */
function runTurnpointIteration(
  result: OLCResult,
  igcPath: string
): string[] | undefined {
  const igcAsPlainText = readIgcFile(igcPath);

  if (!igcAsPlainText) return;
  // IGCParser needs lenient: true because some trackers (e.g. XCTrack) work with additional records in IGC-File which don't apply with IGCParser.

  const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

  // Remove non flight fixes
  const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);

  let igcWithReducedFixes = stripAroundTurnpoints(
    igcAsPlainText,
    result.turnpoints ?? [],
    launchAndLandingIndexes.launch,
    launchAndLandingIndexes.landing
  );
  return igcWithReducedFixes;
}

/**
 * Determines the OLC Binary which will be used. Depends on OS and architecture.
 */
function determineOlcBinary() {
  const os = require("os");
  const platform = os.platform();
  logger.debug(`IA: Running on OS: ${platform} (${os.arch()})`);
  //TODO: This is not failsafe, but good for now;)
  if (platform.includes("win") && !platform.includes("darwin")) {
    return "olc.exe < ";
  }
  if (platform.includes("darwin") && os.arch() != "arm64") {
    return "olc_mac_x64 <";
  }
  if (os.arch() === "arm64") {
    return "olc_lnx_arm < ";
  } else {
    return "olc_lnx < ";
  }
}

async function runOlc(filePath: string, flightTypeFactors: FlightTypeFactors) {
  logger.info("IA: Start OLC analysis " + filePath);
  logger.debug(`IA: CWD of process: ${process.cwd()}`);

  const binary = determineOlcBinary();
  const pathToBinary = path.resolve(__dirname, "..", "igc", binary);

  try {
    const asyncExec = util.promisify(exec);
    const { stdout, stderr } = await asyncExec(pathToBinary + filePath, {
      cwd: path.resolve(__dirname, ".."),
    });
    logger.info(stderr); // Throw won't work as stderr is always defined

    const res = parseOlcData(stdout.toString(), flightTypeFactors);
    return res;
  } catch (error) {
    // TODO: Check what happens to the client when this catches an error
    logger.error(
      "IA: An error occurred while parsing the olc data of " +
        filePath +
        ": " +
        error
    );
  }
}

function parseOlcData(data: string, flightTypeFactors: FlightTypeFactors) {
  const dataLines = data.split("\n");

  let freeStartIndex = 0;
  let flatStartIndex = 0;
  let faiStartIndex = 0;
  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].startsWith("OUT TYPE FREE_FLIGHT")) freeStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FREE_TRIANGLE")) flatStartIndex = i;
    if (dataLines[i].startsWith("OUT TYPE FAI_TRIANGLE")) faiStartIndex = i;
  }

  const distancePrefix = "OUT FLIGHT_KM ";
  const freeDistance = dataLines[freeStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  const flatDistance = dataLines[flatStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");
  const faiDistance = dataLines[faiStartIndex + 1]
    .replace(distancePrefix, "")
    .replace("\r", "");

  logger.debug("IA: FREE DIST: " + freeDistance);
  logger.debug("IA: FLAT DIST: " + flatDistance);
  logger.debug("IA: FAI DIST: " + faiDistance);

  const freeFactor = +freeDistance * flightTypeFactors.FREE;
  const flatFactor = +flatDistance * flightTypeFactors.FLAT;
  const faiFactor = +faiDistance * flightTypeFactors.FAI;

  logger.debug("IA: FREE Factor: " + freeFactor);
  logger.debug("IA: FLAT Factor: " + flatFactor);
  logger.debug("IA: FAI Factor: " + faiFactor);

  let type: TYPE;
  let dist: string;
  let cornerStartIndex: number;
  if (faiFactor > flatFactor && faiFactor > freeFactor && faiStartIndex) {
    type = TYPE.FAI;
    dist = faiDistance;
    cornerStartIndex = faiStartIndex + 4;
  } else if (flatFactor > freeFactor && flatStartIndex) {
    type = TYPE.FLAT;
    dist = flatDistance;
    cornerStartIndex = flatStartIndex + 4;
  } else {
    type = TYPE.FREE;
    dist = freeDistance;
    cornerStartIndex = freeStartIndex + 4;
  }

  const result: OLCResult = {
    turnpoints: [],
    dist,
    type,
  };

  //   TODO: Why exactly five times? I guess takeoff, landing and three turnpoints?
  for (let i = 0; i <= 4; i++) {
    result.turnpoints.push(
      extractTurnpointData(dataLines[cornerStartIndex + i])
    );
  }
  return result;
}

/**
 * Creates a turnpoint object from a response line of the OLC binary.
 */
function extractTurnpointData(turnpoint: string) {
  let result: FlightTurnpoint = {};
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
 * External ID and strip factor are only used to create a unique file name
 */
async function writeIgcToFile(
  flightExternalId: number,
  igcFileLines: string[],
  reduceFactor?: number
): Promise<string> {
  const pathToFile = createFileName(flightExternalId, "", true, reduceFactor);

  logger.debug(`IA: Will start writing content to ${pathToFile}`);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(pathToFile);
    igcFileLines.forEach((value) => file.write(`${value}\n`));

    file.end();
    file.on("finish", () => {
      logger.debug(`IA: wrote all content to file ${pathToFile}`);
      resolve(pathToFile);
    });
    file.on("error", (err) => {
      logger.error(
        `IA: There is an error writing the file ${pathToFile} => ${err}`
      );
      reject();
    });
  });
}
/**
 * Splits the content of an igc file into lines and reduces the amount of B records (location fixes) of the given igc content.
 * B records will be reduced evenly by a factor.
 * Will return the lines of a minified igc file.
 */
function reduceByFactor(
  factor: number,
  igcAsPlainText: string,
  launchIndex: number,
  landingIndex: number
) {
  const lines = igcAsPlainText.split("\n");

  const flightFixes = removeNonFlightIgcLines(lines, launchIndex, landingIndex);

  // Ensure that factor is at least 1
  const stripFactor = factor ? factor : 1;

  let reducedLines = [];
  for (let i = 0; i < flightFixes.length; i++) {
    reducedLines.push(flightFixes[i]);
    if (flightFixes[i] && flightFixes[i].startsWith("B")) {
      i = i + (stripFactor - 1);
    }
  }
  return reducedLines;
}

/**
 * This is a workaround to remove non flight fixes in plain igc files
 */
function removeNonFlightIgcLines(
  lines: string[],
  launchIndex: number,
  landingIndex: number
) {
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
      // Detect non B-Records between B-Records and increase offset to compensate
      if (firstLineWithBRecord && !lines[i].startsWith("B")) offset += 1;
    }
  }
  return newLines;
}

/**
 * Splits the content of an igc file into lines and reduces the amount of B records (location fixes) of the given igc content.
 * B records will only be aggregated around the turnpoints
 * Returns the lines of a minified igc file.
 */
function stripAroundTurnpoints(
  igcAsPlainText: string,
  turnpoints: FlightTurnpoint[],
  launchIndex: number,
  landingIndex: number
) {
  const rawLines = igcAsPlainText.split("\n");

  const lines = removeNonFlightIgcLines(rawLines, launchIndex, landingIndex);
  let lineIndexes = [];
  let tpIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let timeToFind = turnpoints[tpIndex].time?.replace(/:/g, "");
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
 */
function getResolution(igcAsJson: IGCFile) {
  /**
   * Start with the second timestamp.
   * It occurred a few times that the first and second timestamp are in the same second.
   * Maybe this is due to some corner case in the tracker. Therefore skip the first timestamp.
   */
  const referenceTimestamp = igcAsJson.fixes[1].timestamp;
  let currentResolution =
    (igcAsJson.fixes[2].timestamp - referenceTimestamp) / 1000;

  /**
   * Some few pilots have their tracker configured with a tracking interval <1 second.
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
 * Calculates the comparable resolution to which the igc content will be reduced in the first iteration.
 * This value is calculated by the flight duration and a constant factor defined in {@link RESOLUTION_FACTOR}.
 */
function calculateResolutionForReduction(durationInMinutes: number) {
  //For every hour decrease resolution by factor of seconds
  const resolution = Math.floor((durationInMinutes / 60) * RESOLUTION_FACTOR);
  logger.debug(
    `IA: The flight will be calculated with a new resolution of ${resolution} seconds`
  );
  return resolution;
}

function getFlightDuration(igcAsJson: IGCFile) {
  const sizeOfFixes = igcAsJson.fixes.length;
  const durationInMillis =
    igcAsJson.fixes[sizeOfFixes - 1].timestamp - igcAsJson.fixes[0].timestamp;
  const durationInMinutes = durationInMillis / 1000 / 60;
  logger.debug(
    `IA: The duration of the flight is ${durationInMinutes} minutes`
  );
  return durationInMinutes;
}
