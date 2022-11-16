import axios from "axios";
import FormData from "form-data";
import FlightService from "./service/FlightService";
import * as fs from "fs";
import "./db";
import IGCParser, { IGCFile } from "./helper/igc-parser";
import { solver, scoringRules as scoring } from "igc-xc-score";
import { findLaunchAndLandingIndexes } from "./igc/FindLaunchAndLanding";
import { FlightInstance } from "./db/models/Flight";
import { findClosestTakeoff } from "./service/FlyingSiteService";
import { findLanding } from "./igc/LocationFinder";
import config from "./config/env-config";

// Mock data
const igcFilename: string = "104km.igc";
let igcContent = fs.readFileSync(igcFilename, "utf8");
const userId = "cd1583d1-fb7f-4a93-b732-effd59e5c3ae";
const uploadEndpoint = "WEB";

main();
async function main() {
  // G-Check
  const validationResult = await validateIgc(igcContent);
  if (validationResult !== "PASSED") return console.log(validationResult);

  // Create new external ID
  // TODO: Is this prone to collisions when there are simultanious uploads?
  const externalId = await FlightService.createExternalId();

  // Save to DB
  const flightDbRef = (await FlightService.create({
    userId,
    igcPath: "./104km.igc", //req.file.path,
    externalId,
    uploadEndpoint,
    validationResult,
  })) as FlightInstance;

  // Convert igc to JSON
  const igcData = igc2JSON(igcContent);

  // Start alternative OLC calculation
  var startTime = performance.now();
  const result = solver(igcData, scoring.FFVL, { trim: true }).next().value;

  var endTime = performance.now();
  console.log(`*** xc-igc-score took ${endTime - startTime} milliseconds`);

  if (result.optimal) console.log(`score is ${result}`);
  console.warn(result);

  startTime = performance.now();

  // Detect manipulation

  // Remove non flight fixes
  removeNonFlightFixes(igcData);

  // Reduce amount of fixes

  // Calculate airtime
  flightDbRef.airtime = calcAirtime(igcData.fixes);
  console.log("*** Airtime", calcAirtime(igcData.fixes));

  // Add date related stats
  const { takeoffTime, landingTime, isWeekend } = getDateStats(igcData.fixes);

  flightDbRef.takeoffTime = takeoffTime.getTime();
  flightDbRef.landingTime = landingTime.getTime();
  flightDbRef.isWeekend = isWeekend;

  // Check if it's allowed to modify a flight

  // Detect mid-flight start

  // Detect if flight was uploaded before

  endTime = performance.now();
  console.log(`*** everything else ${endTime - startTime} milliseconds`);

  // Detect takeoff and landing location
  const { siteId, region, landing } = await getTakeoffAndLanding(igcData.fixes);

  flightDbRef.siteId = siteId;
  flightDbRef.region = region;
  flightDbRef.landing = landing;

  // Airspace check

  // Start OLC calculation
  await FlightService.startResultCalculation(flightDbRef);

  //

  // TODO: Do not forget to re-enable "checkSiteRecordsAndUpdate(flight)"

  // Save to DB
  const res = await FlightService.update(flightDbRef);
}

// *************************** FUNCTIONS ***************
/**
 * Validate igc with FAI server
 */
type FAIResponse = "FAILED" | "PASSED";
async function validateIgc(igc: string) {
  try {
    const url = "http://vali.fai-civl.org/api/vali/json";
    const formData = new FormData();
    const buffer = Buffer.from(igc);
    formData.append("igcfile", buffer, "104km.igc");

    const config = {
      headers: {
        "Content-Type":
          "multipart/form-data; boundary=" + formData.getBoundary(),
        "Content-length": formData.getLengthSync(),
      },
    };

    const res = await axios.post(url, formData, config);

    return res.data.result as FAIResponse;
  } catch (error) {
    console.log(error);
    return;
  }
}

function igc2JSON(igc: string) {
  return IGCParser.parse(igc, { lenient: true });
}

function removeNonFlightFixes(igcAsJson: IGCFile) {
  const launchAndLandingIndexes = findLaunchAndLandingIndexes(igcAsJson);
  igcAsJson.fixes = igcAsJson.fixes.slice(
    launchAndLandingIndexes.launch,
    launchAndLandingIndexes.landing
  );
}

function getDateStats(fixes: IGCParser.BRecord[]) {
  const takeoffTime = new Date(fixes[0].timestamp);
  const landingTime = new Date(fixes[fixes.length - 1].timestamp);
  const isWeekend = isNoWorkday(takeoffTime);
  return { takeoffTime, landingTime, isWeekend };
}

function calcAirtime(fixes: IGCParser.BRecord[]) {
  return Math.round(
    (fixes[fixes.length - 1].timestamp - fixes[0].timestamp) / 1000 / 60
  );
}

function isNoWorkday(dateAsString: Date) {
  const currentDate = new Date(dateAsString);
  const numberOfday = new Date(currentDate).getDay();
  switch (numberOfday) {
    case 0: //Sunday
    case 5: //Friday
    case 6: //Saturday
      return true;
    default:
      return isHoliday(currentDate);
  }
}

function isHoliday(currentDate: Date) {
  return (
    isFirstOfMay(currentDate) ||
    isEaster(currentDate) ||
    isPentecost(currentDate) ||
    isAscension(currentDate) ||
    isCorpusChristi(currentDate)
  );
}

const { easter } = require("date-easter");

function isEaster(currentDate: Date) {
  // Eastern is meant as easter monday
  const easterDate = new Date(Date.parse(easter(currentDate)));
  return sameDay(currentDate, easterDate);
}

function isPentecost(currentDate: Date) {
  // 7 weeks after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const pentecostDate = new Date(easterDate.valueOf());
  pentecostDate.setDate(pentecostDate.getDate() + 7 * 7);
  return sameDay(currentDate, pentecostDate);
}

function isCorpusChristi(currentDate: Date) {
  //60 days after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const chorpusDate = new Date(easterDate.valueOf());
  chorpusDate.setDate(chorpusDate.getDate() + 60);
  return sameDay(currentDate, chorpusDate);
}

function isAscension(currentDate: Date) {
  //39 days after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const ascensionDate = new Date(easterDate.valueOf());
  ascensionDate.setDate(ascensionDate.getDate() + 39);
  return sameDay(currentDate, ascensionDate);
}

function isFirstOfMay(currentDate: Date) {
  return currentDate.getMonth() == 4 && currentDate.getDate() == 1;
}

function sameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
  );
}

async function getTakeoffAndLanding(fixes: IGCParser.BRecord[]) {
  const requests = [findClosestTakeoff(fixes[0])];
  if (config.get("useGoogleApi")) {
    requests.push(findLanding(fixes[fixes.length - 1]));
  }
  const [takeoff, landing] = await Promise.all(requests);

  const stats = {
    siteId: takeoff.id as string,
    region: takeoff.region as string,
    landing: (landing as string) ?? "API Disabled",
  };

  return { ...stats };
}
