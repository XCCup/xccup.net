const axios = require("axios");
const logger = require("../config/logger");

const isApiDisabled = process.env.USE_GOOGLE_API === "false";

const byLatLong = async (location) => {
  if (isApiDisabled) {
    logger.warn("Usage of Google API is disabled");
    return "API Disabled";
  }
  try {
    // const location = "50.20524528622611,7.064103332484184";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location}&language=de&result_type=locality&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    logger.debug("Request location with ", url);
    const result = await axios.get(url);
    // ZipCode TownName, CountryName
    // const nameOfTown = result.data.results[0].formatted_address;
    // Only TownName
    const nameOfTown = result.data.results[0].address_components[0].long_name;
    return nameOfTown;
  } catch (error) {
    logger.error(error);
    return "API Error";
  }
};

const findLanding = async (landingFix) => {
  logger.info("Will retrieve landing name from Google API");
  return await byLatLong(createRequestString(landingFix));
};

function createRequestString(fix) {
  return fix.latitude + "," + fix.longitude;
}

exports.byLatLong = byLatLong;
exports.findLanding = findLanding;
