import { Request, Response } from "express";
import FlightService from "../service/FlightService";
import { FlightInstance } from "../db/models/Flight";
import { UPLOAD_ENDPOINT } from "../constants/flight-constants";
import FormData from "form-data";
import axios from "axios";
import logger from "../config/logger";
import { findLaunchAndLandingIndexes } from "../igc/FindLaunchAndLanding";
import { BAD_REQUEST } from "../constants/http-status-constants";
import MailService from "../service/MailService";
import * as fs from "fs";
import { findClosestTakeoff } from "../service/FlyingSiteService";
import IGCParser, { IGCFile } from "../helper/igc-parser";
import { findLanding } from "../igc/LocationFinder";
import config from "../config/env-config";
import { easter } from "date-easter";

import { runChecksStartCalculationsStoreFixes } from "../controller/FlightController";

export async function flightUpload(req: Request, res: Response) {
  const userId = req?.user?.id;
  const igcPath = req?.file?.path;

  if (!userId || !igcPath) return;

  // G-Check
  const igcContent = fs.readFileSync(igcPath, "utf8");
  const validationResult = await validateIgc(igcContent);

  if (validationResult !== "PASSED") {
    MailService.sendGCheckInvalidAdminMail(userId, igcPath);
    logger.info(
      "FC: Invalid G-Record found. Validation result: " + validationResult
    );
    res.status(BAD_REQUEST).send("Invalid G-Record");

    return;
  }

  // Save to DB
  const flightDbRef = (await FlightService.create({
    userId,
    igcPath: req?.file?.path,
    externalId: req.externalId,
    uploadEndpoint: UPLOAD_ENDPOINT.WEB,
    validationResult,
  })) as FlightInstance;

  // Convert igc to JSON
  const igcData = igc2JSON(igcContent);

  // Detect manipulation

  // Remove non flight fixes
  removeNonFlightFixes(igcData);

  // Reduce amount of fixes

  // Calculate airtime
  flightDbRef.airtime = calcAirtime(igcData.fixes);

  // Add date related stats
  const { takeoffTime, landingTime, isWeekend } = getDateStats(igcData.fixes);

  flightDbRef.takeoffTime = takeoffTime.getTime();
  flightDbRef.landingTime = landingTime.getTime();
  flightDbRef.isWeekend = isWeekend;

  // Check if it's allowed to modify a flight

  // Detect mid-flight start

  // Detect if flight was uploaded before

  // Detect takeoff and landing location
  const { siteId, region, landing } = await getTakeoffAndLanding(igcData.fixes);
  console.log(siteId);
  flightDbRef.siteId = siteId;
  flightDbRef.region = region;
  flightDbRef.landing = landing;

  // Airspace check

  // Start OLC calculation
  await FlightService.startResultCalculation(flightDbRef);

  //

  // TODO: Do not forget to re-enable "checkSiteRecordsAndUpdate(flight)"

  // Save to DB
  await FlightService.update(flightDbRef);

  // Airspace check / takeoff name / result calculation
  const { takeoffName, result, airspaceViolation } =
    await runChecksStartCalculationsStoreFixes(flightDbRef, userId);
  console.log(takeoffName);

  res.json({
    flightId: flightDbRef.id,
    externalId: flightDbRef.externalId,
    airspaceViolation,
    takeoff: takeoffName,
    landing: result.landing,
  });
}

export default flightUpload;

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

interface Takeoff {
  id: string;
  name: string;
  elevation: number;
  distance: number;
}

async function getTakeoffAndLanding(fixes: IGCParser.BRecord[]) {
  const requests = [findClosestTakeoff(fixes[0])];
  if (config.get("useGoogleApi")) {
    requests.push(findLanding(fixes[fixes.length - 1]));
  }
  const [takeoff, landing] = await Promise.all(requests);

  console.log(takeoff);
  console.log(landing);
  const stats = {
    takeoff: takeoff as Takeoff,
    landing: (landing as string) ?? "API Disabled",
  };

  return { ...stats };
}

function getDateStats(fixes: IGCParser.BRecord[]) {
  const takeoffTime = new Date(fixes[0].timestamp);
  const landingTime = new Date(fixes[fixes.length - 1].timestamp);
  const isWeekend = isNoWorkday(takeoffTime);
  return { takeoffTime, landingTime, isWeekend };
}

function calcAirtime(fixes: IGCParser.BRecord[]) {
  console.log(fixes[fixes.length - 1].timestamp - fixes[0].timestamp);
  console.log(
    (fixes[fixes.length - 1].timestamp - fixes[0].timestamp) / 1000 / 60
  );

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

function isEaster(currentDate: Date) {
  // Eastern is meant as easter monday
  //   @ts-ignore

  const easterDate = new Date(Date.parse(easter(currentDate)));
  return sameDay(currentDate, easterDate);
}

function isPentecost(currentDate: Date) {
  // 7 weeks after easter
  //   @ts-ignore

  const easterDate = new Date(Date.parse(easter(currentDate)));
  const pentecostDate = new Date(easterDate.valueOf());
  pentecostDate.setDate(pentecostDate.getDate() + 7 * 7);
  return sameDay(currentDate, pentecostDate);
}

function isCorpusChristi(currentDate: Date) {
  //60 days after easter
  //   @ts-ignore
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const chorpusDate = new Date(easterDate.valueOf());
  chorpusDate.setDate(chorpusDate.getDate() + 60);
  return sameDay(currentDate, chorpusDate);
}

function isAscension(currentDate: Date) {
  //39 days after easter
  easter(currentDate);
  //   @ts-ignore

  const easterDate = new Date(Date.parse(easter(currentDate)));
  const ascensionDate = new Date(easterDate.valueOf());
  ascensionDate.setDate(ascensionDate.getDate() + 39);
  return sameDay(currentDate, aate);
}
function sameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
  );
}

function isFirstOfMay(currentDate: Date) {
  return currentDate.getMonth() == 4 && currentDate.getDate() == 1;
}

/**
 * Temp functions
 */
