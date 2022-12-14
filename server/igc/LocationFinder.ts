import axios from "axios";
import axiosRetry from "axios-retry";
import config from "../config/env-config";
import logger from "../config/logger";
import { FlightFixCombined } from "../types/FlightFixes";

interface GoogleLocationResponse {
  results: GoogleLocation[];
  plus_code?: { compound_code?: string };
}
interface GoogleLocation {
  address_components: [{ long_name?: string }];
}

const isApiDisabled = config.get("useGoogleApi") == false;

axiosRetry(axios, { retries: 2 });

const byLatLong = async (location: string) => {
  if (isApiDisabled) {
    logger.warn("LF: Usage of Google API is disabled");
    return "API Disabled";
  }
  try {
    // const location = "50.20524528622611,7.064103332484184";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location}&language=de&result_type=locality&key=${config.get(
      "googleMapsApiKey"
    )}`;
    logger.debug("LF: Request location with ", url);
    const result = await axios.get(url, { timeout: 10000 });
    const data = result.data;
    // ZipCode TownName, CountryName
    // const nameOfTown = result.data.results[0].formatted_address;
    // Only TownName
    const nameOfTown = retrieveNameFromResponse(data);
    return nameOfTown;
  } catch (error) {
    logger.error(error);
    return "API Error";
  }
};

export const findLanding = async (landingFix: FlightFixCombined) => {
  logger.info("LF: Will retrieve landing name from Google API");
  return await byLatLong(createRequestString(landingFix));
};

function retrieveNameFromResponse(data: GoogleLocationResponse) {
  const longName = data.results[0].address_components[0]?.long_name;
  if (longName) return longName;

  const nameFromCompoundCode = data.plus_code?.compound_code;
  const compoundRegex = /\w+\+\w+ (.*)/;
  const matchResult = nameFromCompoundCode?.match(compoundRegex);
  if (matchResult) {
    logger.info("LF: No address included. Will use compound code");
    return matchResult[1];
  }

  return "Nicht verfügbar";
}

function createRequestString(fix: FlightFixCombined) {
  return fix.latitude + "," + fix.longitude;
}

exports.byLatLong = byLatLong;
exports.findLanding = findLanding;
