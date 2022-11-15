import axios from "axios";
import FormData from "form-data";
import FlightService from "./service/FlightService";
import * as fs from "fs";
import "./db";
import IGCParser, { IGCFile } from "./helper/igc-parser";
import { findLaunchAndLandingIndexes } from "./igc/FindLaunchAndLanding";

// Mock data
const igcFilename: string = "104km.igc";
let igcContent = fs.readFileSync(igcFilename, "utf8");
const userId = "cd1583d1-fb7f-4a93-b732-effd59e5c3ae";
const uploadEndpoint = "WEB";

main();
async function main() {
  // G-Check
  const validationResult = await validateIgc(igcContent);
  console.log(validationResult);
  if (validationResult !== "PASSED") return; // TODO: Inform admin

  // TODO: Is this prone to collisions when there are simultanious uploads?
  const externalId = await FlightService.createExternalId();

  // Save to DB
  const flightDbRef = await FlightService.create({
    userId,
    igcPath: "./104km.igc", //req.file.path,
    externalId,
    uploadEndpoint,
    validationResult,
  });

  // Convert igc to JSON
  const igcData = igc2JSON(igcContent);

  // Detect manipulation

  // Remove non flight fixes
  removeNonFlightFixes(igcData);

  // Reduce amount of fixes

  // Airspace check

  // Detect takeoff and landing location
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
