const { expect } = require("@jest/globals");
const { byLatLong, findLanding } = require("../igc/LocationFinder");

const isApiActive = process.env.USE_GOOGLE_API === true;

test("Validate a location name for a specific latLong", (done) => {
  //50.22134205072505, 7.067118217391005 -> Müllenbacher Dom, Hauptstraße 41, 56761 Müllenbach
  //https://maps.googleapis.com/maps/api/geocode/json?latlng=50.22134205072505,7.067118217391005&result_type=locality&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  const location = "50.22134205072505,7.067118217391";

  const expectedResult = isApiActive ? "Müllenbach" : "API Disabled";
  // const expectedResult = "56761 Müllenbach, Deutschland";

  byLatLong(location)
    .then((result) => {
      expect(result).toBe(expectedResult);
      done();
    })
    .catch((error) => {
      done(error);
    });
});

test("Validate a location name by a flightFix", (done) => {
  const landingFix = {
    elevation: 248,
    latitude: 50.107056174849944,
    longitude: 7.114786188739389,
  };

  const expectedResultLanding = isApiActive ? "Bremm" : "API Disabled";

  findLanding(landingFix)
    .then((nameOfLanding) => {
      expect(nameOfLanding).toBe(expectedResultLanding);
      done();
    })
    .catch((error) => {
      done(error);
    });
});
