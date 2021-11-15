/**
 * @jest-environment node
 */
const Helper = require("./IgcTestHelper");
const IGCParser = require("igc-parser");
const ElevationAttacher = require("../igc/ElevationAttacher");

function retrieveIgcFixes(folder, file) {
  const igcAsPlainText = Helper.readIgcFile(folder, file);
  return IGCParser.parse(igcAsPlainText, { lenient: true }).fixes;
}

test("Attach elevation data to position fixes and check values", (done) => {
  jest.setTimeout(20_000);

  const fixes = retrieveIgcFixes("kai_short", "only_14_fixes.igc");

  const ELEVATION_DELTA = 15;

  const firstFix = {
    elevation: 356,
    latitude: 50.10681666666667,
    longitude: 7.114816666666667,
  };

  const lastFix = {
    elevation: 355,
    latitude: 50.10681666666667,
    longitude: 7.114833333333333,
  };

  try {
    ElevationAttacher.execute(fixes, (fixesWithElevation) => {
      expect(fixesWithElevation[0].elevation).toBeGreaterThanOrEqual(
        firstFix.elevation - ELEVATION_DELTA
      );
      expect(fixesWithElevation[0].elevation).toBeLessThan(
        firstFix.elevation + ELEVATION_DELTA
      );
      expect(fixesWithElevation[0].latitude).toBe(firstFix.latitude);
      expect(fixesWithElevation[0].longitude).toBe(firstFix.longitude);

      expect(
        fixesWithElevation[fixesWithElevation.length - 1].elevation
      ).toBeGreaterThanOrEqual(lastFix.elevation - ELEVATION_DELTA);
      expect(
        fixesWithElevation[fixesWithElevation.length - 1].elevation
      ).toBeLessThan(lastFix.elevation + ELEVATION_DELTA);
      expect(fixesWithElevation[fixesWithElevation.length - 1].latitude).toBe(
        lastFix.latitude
      );
      expect(fixesWithElevation[fixesWithElevation.length - 1].longitude).toBe(
        lastFix.longitude
      );

      expect(fixesWithElevation[0].gpsAltitude).toBeDefined();
      expect(fixesWithElevation[0].pressureAltitude).toBeDefined();
      expect(fixesWithElevation[0].timestamp).toBeDefined();
      expect(fixesWithElevation[0].time).toBeDefined();

      done();
    });
  } catch (error) {
    done(error);
  }
});
