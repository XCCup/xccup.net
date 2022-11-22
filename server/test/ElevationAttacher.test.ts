/**
 * @jest-environment node
 */
import Helper from "./IgcTestHelper";
import IGCParser from "../helper/igc-parser";
import { getElevationData, addElevationToFixes } from "../igc/ElevationHelper";
import { BRecordElevation } from "../types/FlightFixes";

function retrieveIgcFixes(folder: string, file: string) {
  const igcAsPlainText = Helper.readIgcFile(folder, file);
  return IGCParser.parse(igcAsPlainText, { lenient: true })
    .fixes as BRecordElevation[];
}

test("Attach elevation data to position fixes and check values", async () => {
  jest.setTimeout(20_000);

  const fixes = retrieveIgcFixes("kai_short", "only_14_fixes.igc");

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

  const elevations = await getElevationData(fixes);
  addElevationToFixes(fixes, elevations);

  expect(fixes[0].elevation).toBeGreaterThanOrEqual(firstFix.elevation);

  expect(fixes[0].elevation).toBeLessThan(firstFix.elevation);
  expect(fixes[0].latitude).toBe(firstFix.latitude);
  expect(fixes[0].longitude).toBe(firstFix.longitude);

  expect(fixes[fixes.length - 1].elevation).toBeGreaterThanOrEqual(
    lastFix.elevation
  );
  expect(fixes[fixes.length - 1].elevation).toBeLessThan(lastFix.elevation);
  expect(fixes[fixes.length - 1].latitude).toBe(lastFix.latitude);
  expect(fixes[fixes.length - 1].longitude).toBe(lastFix.longitude);

  expect(fixes[0].gpsAltitude).toBeDefined();
  expect(fixes[0].pressureAltitude).toBeDefined();
  expect(fixes[0].timestamp).toBeDefined();
  expect(fixes[0].time).toBeDefined();
});
