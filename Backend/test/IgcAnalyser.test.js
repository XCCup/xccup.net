const IgcAnalyzer = require("../igc/IgcAnalyzer");

test("Validate an igc-File which should result to a FAI triangle", (done) => {
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_fai",
    type: "FAI",
    dist: "60.428",
    // In comparison to dist, the pts value will be of type integer.
    // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
    pts: 361.35944,
    turnpoints: {
      time: "13:33:04",
      lat: 49.86705,
      long: 6.8431,
    },
  };

  try {
    IgcAnalyzer.startCalculation(expectedFlight, (result) => {
      expect(result.type).toBe(expectedFlight.type);
      expect(result.pts).toBe(expectedFlight.pts);
      expect(result.dist).toBe(expectedFlight.dist);
      expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
      expect(result.flightId).toBe(expectedFlight.id);
      done();
    });
  } catch (error) {
    done(error);
  }
});

test("Validate an igc-File which should result to a FLAT triangle", (done) => {
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_flat",
    type: "FLAT",
    dist: "97.107",
    // In comparison to dist, the pts value will be of type integer.
    // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
    pts: 530.20422,
    turnpoints: {
      time: "14:13:06",
      lat: 49.78081666666667,
      long: 6.6822,
    },
  };

  try {
    IgcAnalyzer.startCalculation(expectedFlight, (result) => {
      expect(result.type).toBe(expectedFlight.type);
      expect(result.pts).toBe(expectedFlight.pts);
      expect(result.dist).toBe(expectedFlight.dist);
      expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
      expect(result.flightId).toBe(expectedFlight.id);
      done();
    });
  } catch (error) {
    done(error);
  }
});

test("Validate an igc-File which should result to a free flight", (done) => {
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_free",
    type: "FREE",
    dist: "79.353",
    // In comparison to dist, the pts value will be of type integer.
    // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
    pts: 226.94957999999997,
    turnpoints: {
      time: "12:36:24",
      lat: 50.3127,
      long: 7.42125,
    },
  };

  try {
    IgcAnalyzer.startCalculation(expectedFlight, (result) => {
      expect(result.type).toBe(expectedFlight.type);
      expect(result.pts).toBe(expectedFlight.pts);
      expect(result.dist).toBe(expectedFlight.dist);
      expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
      expect(result.flightId).toBe(expectedFlight.id);
      done();
    });
  } catch (error) {
    done(error);
  }
});

test("Validate that the number of fixes was reduced (IGC-File Resolution = 1s => Reducion by factor 5)", () => {
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_free",
  };
  const numberOfFixes = 2979;
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
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_flat_res2",
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
  process.env.FLIGHT_STORE = "./igc/demo_igcs";

  const expectedFlight = {
    id: "kai_free_res10",
  };
  const numberOfFixes = 1809;
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
