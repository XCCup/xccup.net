const axios = require("axios");
const axiosRetry = require("axios-retry");
const { default: config } = require("../config/env-config");
const logger = require("../config/logger");

const isApiDisabled = config.get("useGoogleApi") == false;

axiosRetry(axios, { retries: 2 });

const byLatLong = async (location) => {
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
    // ZipCode TownName, CountryName
    // const nameOfTown = result.data.results[0].formatted_address;
    // Only TownName
    const nameOfTown = retrieveNameFromResponse(result);
    return nameOfTown;
  } catch (error) {
    logger.error(error);
    return "API Error";
  }
};

const findLanding = async (landingFix) => {
  logger.info("LF: Will retrieve landing name from Google API");
  return await byLatLong(createRequestString(landingFix));
};

function retrieveNameFromResponse(result) {
  const longName = result.data.results[0]?.address_components[0]?.long_name;
  if (longName) return longName;

  const nameFromCompoundCode = result.data.plus_code?.compound_code;
  const compoundRegex = /\w+\+\w+ (.*)/;
  const matchResult = nameFromCompoundCode?.match(compoundRegex);
  if (matchResult) {
    logger.info("LF: No address included. Will use compound code");
    return matchResult[1];
  }

  return "Nicht verfügbar";
}

function createRequestString(fix) {
  return fix.latitude + "," + fix.longitude;
}

exports.byLatLong = byLatLong;
exports.findLanding = findLanding;
