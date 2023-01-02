import path from "path";
import logger from "../config/logger";
import { calculateFlightResult, extractFixes } from "../igc/IgcAnalyzer";

const flightTypeFactors = {
  FAI: 2,
  FLAT: 1.5,
  FREE: 1,
};

beforeEach(() => {
  // Supress logging to console
  // @ts-ignore
  jest.spyOn(logger, "debug").mockImplementation(() => {});
  // @ts-ignore
  jest.spyOn(logger, "info").mockImplementation(() => {});
});

test("Validate an igc-File which should result to a FAI triangle", async () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_fai/fai_60km42_3h53m.igc";

  const flightToAnaylze = {
    externalId: 666,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    type: "FAI",
    dist: "60.428",
    turnpoints: {
      time: "13:33:04",
      lat: 49.86705,
      long: 6.8431,
    },
  };

  const result = await calculateFlightResult(
    flightToAnaylze.igcPath,
    flightToAnaylze.externalId,
    flightTypeFactors
  );
  expect(result.type).toBe(expectedFlight.type);
  expect(result.dist).toBe(expectedFlight.dist);
  expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
});

test("Validate an igc-File which should result to a FLAT triangle", async () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_flat/drei_97km16_6h15m.igc";

  const flightToAnaylze = {
    externalId: 492,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    type: "FLAT",
    dist: "97.154",
    turnpoints: {
      time: "14:13:06",
      lat: 49.78081666666667,
      long: 6.6822,
    },
  };

  const result = await calculateFlightResult(
    flightToAnaylze.igcPath,
    flightToAnaylze.externalId,
    flightTypeFactors
  );
  expect(result.type).toBe(expectedFlight.type);
  expect(result.dist).toBe(expectedFlight.dist);
  expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
});

test("Validate an igc-File which should result to a free flight", async () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_free/free_79km35_4h8m.igc";

  const flightToAnaylze = {
    externalId: 667,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    type: "FREE",
    dist: "79.353",
    turnpoints: {
      time: "12:36:24",
      lat: 50.3127,
      long: 7.42125,
    },
  };

  const result = await calculateFlightResult(
    flightToAnaylze.igcPath,
    flightToAnaylze.externalId,
    flightTypeFactors
  );
  expect(result.type).toBe(expectedFlight.type);
  expect(result.dist).toBe(expectedFlight.dist);
  expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
});

test("Validate an igc-File were two turnpoints match", async () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath =
    "demo_igcs/user/73883_2022-04-19_13.39_Donnersberg__Baeren.igc";

  const flightToAnaylze = {
    externalId: 668,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    type: "FAI",
    dist: "16.511",
  };

  const result = await calculateFlightResult(
    flightToAnaylze.igcPath,
    flightToAnaylze.externalId,
    flightTypeFactors
  );
  expect(result.type).toBe(expectedFlight.type);
  expect(result.dist).toBe(expectedFlight.dist);
});

test("Validate that the landing is detected (even when igc has more fixes)", async () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/flight_with_car_drive/flight_with_car_drive.igc";

  const flightToAnaylze = {
    externalId: 67,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    type: "FREE",
    dist: "2.345",
  };
  const result = await calculateFlightResult(
    flightToAnaylze.igcPath,
    flightToAnaylze.externalId,
    flightTypeFactors
  );

  expect(result.type).toBe(expectedFlight.type);
  expect(result.dist).toBe(expectedFlight.dist);
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 1s => Reducion by factor 5)", () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_free/free_79km35_4h8m.igc";

  const expectedFlight = {
    externalId: 592,
    igcPath: path.join(__dirname, "../igc", filePath),
  };
  const numberOfFixes = 2978;
  const fixNr2345 = {
    time: "13:13:26",
    timestamp: 1595078006000,
    latitude: 50.35896666666667,
    longitude: 7.363816666666667,
    gpsAltitude: 1088,
    pressureAltitude: 1025,
  };

  const reducedFixes = extractFixes(expectedFlight.igcPath);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[2345]).toStrictEqual(fixNr2345);
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 2s => Reducion by factor 3 -> ceil(5/2))", () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_flat_res2/kai_flat_res2.igc";

  const expectedFlight = {
    externalId: 29,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const numberOfFixes = 3757;
  const fixNr2345 = {
    time: "14:30:24",
    timestamp: 1589725824000,
    latitude: 49.81915,
    longitude: 6.773883333333333,
    gpsAltitude: 943,
    pressureAltitude: 874,
  };

  const reducedFixes = extractFixes(expectedFlight.igcPath);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[2345]).toStrictEqual(fixNr2345);
});

test.skip("Validate that a flight igc does not start mid flight", () => {
  // TODO: Test me!
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 10s => No Reducion)", () => {
  const filePath = "demo_igcs/kai_free_res10/kai_free_res10.igc";

  const expectedFlight = {
    externalId: 329,
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const numberOfFixes = 1807;
  const fixNr234 = {
    time: "10:24:43",
    timestamp: 1595067883000,
    latitude: 50.10693333333333,
    longitude: 7.17165,
    gpsAltitude: 945,
    pressureAltitude: 878,
  };

  const reducedFixes = extractFixes(expectedFlight.igcPath);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[234]).toStrictEqual(fixNr234);
});
