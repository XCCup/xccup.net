// const { Client } = require("@googlemaps/google-maps-services-js");
const axios = require("axios");

const byLatLong = async (location) => {
  try {
    // const location = "50.20524528622611,7.064103332484184";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location}&language=de&result_type=locality&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    console.log(url);
    const result = await axios.get(url);
    // ZipCode TownName, CountryName
    // const nameOfTown = result.data.results[0].formatted_address;
    // Only TownName
    const nameOfTown = result.data.results[0].address_components[0].long_name;
    return nameOfTown;
  } catch (error) {
    console.log(error);
    return "API Error";
  }
};

const findTakeoffAndLanding = async (takeoffFix, landingFix) => {
  console.log("Will add takeoff and landing name");
  const nameOfTakeoff = await byLatLong(createRequestString(takeoffFix));
  const nameOfLanding = await byLatLong(createRequestString(landingFix));

  return {
    nameOfTakeoff: nameOfTakeoff,
    nameOfLanding: nameOfLanding,
  };
};

function createRequestString(fix) {
  return fix.latitude + "," + fix.longitude;
}

exports.byLatLong = byLatLong;
exports.findTakeoffAndLanding = findTakeoffAndLanding;
