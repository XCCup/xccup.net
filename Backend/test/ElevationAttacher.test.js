/**
 * @jest-environment node
 */
const { readIgcFile } = require("./IgcTestHelper");
const IGCParser = require("igc-parser");
const ElevationAttacher = require("../igc/ElevationAttacher");

function retrieveIgcFixes(folder, file) {
  const igcAsPlainText = readIgcFile(folder, file);
  return IGCParser.parse(igcAsPlainText, { lenient: true }).fixes;
}

test("Attach elevation data to position fixes and check values", (done) => {
  const fixes = retrieveIgcFixes("kai_short", "only_14_fixes.igc");

  const firstFix = {
    elevation: 250,
    latitude: 49.95786666666667,
    longitude: 6.994783333333333,
  };

  const lastFix = {
    elevation: 248,
    latitude: 49.95823333333333,
    longitude: 6.994166666666667,
  };

  try {
    ElevationAttacher.execute(fixes, (fixesWithElevation) => {
      expect(fixesWithElevation[0].elevation).toBe(firstFix.elevation);
      expect(fixesWithElevation[0].latitude).toBe(firstFix.latitude);
      expect(fixesWithElevation[0].longitude).toBe(firstFix.longitude);

      expect(fixesWithElevation[fixesWithElevation.length - 1].elevation).toBe(
        lastFix.elevation
      );
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
