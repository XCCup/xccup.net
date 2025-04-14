import { FlightInstance } from "../db/models/Flight";
import { getMetarData } from "../helper/METAR";
import { FlightFixCombined } from "../types/FlightFixes";

test.skip("Test that METAR service is responding correctly", (done) => {
  const flightObject = { save: () => {} } as FlightInstance;
  const spy = jest.spyOn(flightObject, "save");
  // Fixes are taken from the 104.igc file, which is also used in the frontend e2e test
  const flightFixes: FlightFixCombined[] = [
    // Takeoff fix
    {
      timestamp: 1653214183000,
      time: "10:09:43",
      latitude: 51.2457,
      longitude: 9.846316666666667,
      pressureAltitude: 484,
      gpsAltitude: 549,
    },
    // Close after takeoff
    {
      timestamp: 1653214295000,
      time: "10:11:35",
      latitude: 51.2457,
      longitude: 9.846316666666667,
      pressureAltitude: 484,
      gpsAltitude: 549,
    },
    // Close before landing
    {
      timestamp: 1653235236000,
      time: "16:00:36",
      latitude: 51.20783333333333,
      longitude: 9.97175,
      pressureAltitude: 502,
      gpsAltitude: 622,
    },
    // Landing fix
    {
      timestamp: 1653235536000,
      time: "16:05:36",
      latitude: 51.20783333333333,
      longitude: 9.97175,
      pressureAltitude: 502,
      gpsAltitude: 622,
    },
  ];

  // FIXME: Test data to old? Mock actual request to API?
  const expectedMetarDataFirstEntry =
    "METAR EDVK 221050Z 35006KT 320V030 9999 SCT041 17/08 Q1016";
  const expectedMetarDataLastEntry =
    "METAR EDVK 221550Z VRB03KT 9999 FEW048 20/08 Q1014";

  getMetarData(flightObject, flightFixes)
    .then((result) => {
      expect(spy).toHaveBeenCalled();

      // @ts-ignore
      expect(result[0]).toBe(expectedMetarDataFirstEntry);
      // @ts-ignore
      expect(result[1]).toBe(expectedMetarDataLastEntry);

      done();
    })
    .catch((error) => {
      done(error);
    });
});
