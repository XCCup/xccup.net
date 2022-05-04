const path = require("path");
const logger = require("../config/logger");
const IgcAnalyzer = require("../igc/IgcAnalyzer");

const flightTypeFactors = {
  FAI: 2,
  FLAT: 1.5,
  FREE: 1,
};

beforeEach(() => {
  // Supress logging to console
  jest.spyOn(logger, "debug").mockImplementation(() => {});
  jest.spyOn(logger, "info").mockImplementation(() => {});
});

test("Validate an igc-File which should result to a FAI triangle", (done) => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_fai/fai_60km42_3h53m.igc";

  const flightToAnaylze = {
    externalId: "kai_fai",
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    externalId: "kai_fai",
    type: "FAI",
    dist: "60.428",
    turnpoints: {
      time: "13:33:04",
      lat: 49.86705,
      long: 6.8431,
    },
    igcPath: filePath,
  };

  try {
    IgcAnalyzer.startCalculation(
      flightToAnaylze,
      flightTypeFactors,
      (result) => {
        expect(result.type).toBe(expectedFlight.type);
        expect(result.dist).toBe(expectedFlight.dist);
        expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
        expect(result.id).toBe(expectedFlight.id);
        expect(result.igcPath).toContain(expectedFlight.igcPath);
        done();
      }
    );
  } catch (error) {
    done(error);
  }
});

test("Validate an igc-File which should result to a FLAT triangle", (done) => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_flat/drei_97km16_6h15m.igc";

  const flightToAnaylze = {
    externalId: "kai_flat",
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    externalId: "kai_flat",
    type: "FLAT",
    dist: "97.154",
    turnpoints: {
      time: "14:13:06",
      lat: 49.78081666666667,
      long: 6.6822,
    },
    igcPath: filePath,
  };

  try {
    IgcAnalyzer.startCalculation(
      flightToAnaylze,
      flightTypeFactors,
      (result) => {
        expect(result.type).toBe(expectedFlight.type);
        expect(result.dist).toBe(expectedFlight.dist);
        expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
        expect(result.id).toBe(expectedFlight.id);
        expect(result.igcPath).toContain(expectedFlight.igcPath);
        done();
      }
    );
  } catch (error) {
    done(error);
  }
});

test("Validate an igc-File which should result to a free flight", (done) => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_free/free_79km35_4h8m.igc";

  const flightToAnaylze = {
    externalId: "kai_free",
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    externalId: "kai_free",
    type: "FREE",
    dist: "79.353",
    turnpoints: {
      time: "12:36:24",
      lat: 50.3127,
      long: 7.42125,
    },
    igcPath: filePath,
  };

  try {
    IgcAnalyzer.startCalculation(
      flightToAnaylze,
      flightTypeFactors,
      (result) => {
        expect(result.type).toBe(expectedFlight.type);
        expect(result.dist).toBe(expectedFlight.dist);
        expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
        expect(result.id).toBe(expectedFlight.id);
        expect(result.igcPath).toContain(expectedFlight.igcPath);
        done();
      }
    );
  } catch (error) {
    done(error);
  }
});

test("Validate an igc-File were two turnpoints match", (done) => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath =
    "demo_igcs/user/73883_2022-04-19_13.39_Donnersberg__Baeren.igc";

  const flightToAnaylze = {
    externalId: "user",
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    externalId: "user",
    type: "FAI",
    dist: "16.511",
    igcPath: filePath,
  };

  try {
    IgcAnalyzer.startCalculation(
      flightToAnaylze,
      flightTypeFactors,
      (result) => {
        expect(result.type).toBe(expectedFlight.type);
        expect(result.dist).toBe(expectedFlight.dist);
        expect(result.id).toBe(expectedFlight.id);
        expect(result.igcPath).toContain(expectedFlight.igcPath);
        done();
      }
    );
  } catch (error) {
    done(error);
  }
});

test("Validate that the landing is detected (even when igc has more fixes)", (done) => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/flight_with_car_drive/flight_with_car_drive.igc";

  const flightToAnaylze = {
    externalId: "flight_with_car_drive",
    igcPath: path.join(__dirname, "../igc", filePath),
  };

  const expectedFlight = {
    externalId: "flight_with_car_drive",
    type: "FREE",
    dist: "2.351",
    igcPath: filePath,
  };

  try {
    IgcAnalyzer.startCalculation(
      flightToAnaylze,
      flightTypeFactors,
      (result) => {
        expect(result.type).toBe(expectedFlight.type);
        expect(result.dist).toBe(expectedFlight.dist);
        expect(result.id).toBe(expectedFlight.id);
        expect(result.igcPath).toContain(expectedFlight.igcPath);
        done();
      }
    );
  } catch (error) {
    done(error);
  }
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 1s => Reducion by factor 5)", () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_free/free_79km35_4h8m.igc";

  const expectedFlight = {
    externalId: "kai_free",
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

  const reducedFixes = IgcAnalyzer.extractFixes(expectedFlight);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[2345]).toStrictEqual(fixNr2345);
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 2s => Reducion by factor 3 -> ceil(5/2))", () => {
  process.env.SERVER_DATA_PATH = "./igc/demo_igcs";
  const filePath = "demo_igcs/kai_flat_res2/kai_flat_res2.igc";

  const expectedFlight = {
    externalId: "kai_flat_res2",
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

  const reducedFixes = IgcAnalyzer.extractFixes(expectedFlight);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[2345]).toStrictEqual(fixNr2345);
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 10s => No Reducion)", () => {
  const filePath = "demo_igcs/kai_free_res10/kai_free_res10.igc";

  const expectedFlight = {
    externalId: "kai_free_res10",
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

  const reducedFixes = IgcAnalyzer.extractFixes(expectedFlight);

  expect(reducedFixes.length).toBe(numberOfFixes);
  expect(reducedFixes[234]).toStrictEqual(fixNr234);
});
