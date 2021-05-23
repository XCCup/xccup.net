const { expect } = require("@jest/globals");
const { byLatLong, findTakeoffAndLanding } = require("../igc/LocationFinder");

test("Validate an a location name for a specific latLong", (done) => {
  //50.22134205072505, 7.067118217391005 -> Müllenbacher Dom, Hauptstraße 41, 56761 Müllenbach
  //https://maps.googleapis.com/maps/api/geocode/json?latlng=50.22134205072505,7.067118217391005&result_type=locality&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  const location = "50.22134205072505,7.067118217391";

  const expectedResult = "56761 Müllenbach, Deutschland";

  byLatLong(location)
    .then((result) => {
      expect(result).toBe(expectedResult);
      done();
    })
    .catch((error) => {
      done(error);
    });
});

test("Validate an a location name for a two fixes", (done) => {
  const takeoffFix = {
    elevation: 250,
    latitude: 49.95786666666667,
    longitude: 6.994783333333333,
  };

  const landingFix = {
    elevation: 248,
    latitude: 50.107056174849944,
    longitude: 7.114786188739389,
  };

  const expectedResultTakeoff = "Zeltingen-Rachtig, Deutschland";
  const expectedResultLanding = "Bremm, Deutschland";

  findTakeoffAndLanding(takeoffFix, landingFix)
    .then((result) => {
      console.log(result);
      expect(result.nameOfTakeoff).toBe(expectedResultTakeoff);
      expect(result.nameOfLanding).toBe(expectedResultLanding);
      done();
    })
    .catch((error) => {
      done(error);
    });
});
