/**
 * @jest-environment node
 */
const Helper = require("./IgcTestHelper");
const IGCParser = require("../helper/igc-parser");
const moment = require("moment");

function retrieveIgcFixes(folder, file) {
  const igcAsPlainText = Helper.readIgcFile(folder, file);
  return IGCParser.parse(igcAsPlainText, { lenient: true }).fixes;
}

const FlightStatsCalculator = require("../igc/FlightStatsCalculator");

test("Constant climb of 5 m/s on flight with 5 second resolution; Static horizontal position", () => {
  const fixes = createFixesWithConstantClimb(100, 5, 5, 50);

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 0;
  const expectMaxHeightBaro = 475;
  const expectMinHeightGps = 50;
  const expectMaxHeightGps = 525;

  const expectMaxSink = 0;
  const expectMaxClimb = 5;
  const expectMaxSpeed = 0;
  const expectFixClimb = 5;
  const expectFixSpeed = 0;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[10].climb).toBe(expectFixClimb);
  expect(fixesStats[10].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

test.only("Constant sink of 2 m/s on flight with 2 second resolution; Static horizontal position", () => {
  const fixes = createFixesWithConstantClimb(100, 2, -2, 50, 500);

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 304;
  const expectMaxHeightBaro = 500;
  const expectMinHeightGps = 354;
  const expectMaxHeightGps = 550;

  const expectMaxSink = -2;
  const expectMaxClimb = 0;
  const expectMaxSpeed = 0;
  const expectFixClimb = -2;
  const expectFixSpeed = 0;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[40].climb).toBe(expectFixClimb);
  expect(fixesStats[40].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

test("Constant climb of 3.5 m/s on flight with 1 second resolution; Static horizontal position", () => {
  const fixes = createFixesWithConstantClimb(100, 1, 3.5, 50);

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 0;
  const expectMaxHeightBaro = 346.5;
  const expectMinHeightGps = 50;
  const expectMaxHeightGps = 396.5;

  const expectMaxSink = 0;
  const expectMaxClimb = 3.5;
  const expectMaxSpeed = 0;
  const expectFixClimb = 3.5;
  const expectFixSpeed = 0;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[50].climb).toBe(expectFixClimb);
  expect(fixesStats[50].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

test("Check if stats are correct for a flight with a fixes resolution of 10s", () => {
  const fixes = retrieveIgcFixes("kai_free_res10", "kai_free_res10.igc");

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 281;
  const expectMaxHeightBaro = 2278;
  const expectMinHeightGps = 323;
  const expectMaxHeightGps = 2355;

  const expectMaxSink = -3.9;
  const expectMaxClimb = 3.5;
  const expectMaxSpeed = 60.29;
  const expectFixClimb = 1.6;
  const expectFixSpeed = 23.03;

  // Values for TIME_FRAME = 30
  // const expectMaxSink = -4;
  // const expectMaxClimb = 4;
  // const expectMaxSpeed = 63.61;
  // const expectFixClimb = 2.1;
  // const expectFixSpeed = 34.01;

  // Values for TIME_FRAME = 10
  // const expectMaxSink = -5;
  // const expectMaxClimb = 4.2;
  // const expectMaxSpeed = 68.52;
  // const expectFixClimb = 1.4;
  // const expectFixSpeed = 42.6;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[234].climb).toBe(expectFixClimb);
  expect(fixesStats[234].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

test("Check if stats are correct for a flight with a fixes resolution of 1s", () => {
  const fixes = retrieveIgcFixes("kai_fai", "fai_60km42_3h53m.igc");

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 119;
  const expectMaxHeightBaro = 2354;
  const expectMinHeightGps = 252;
  const expectMaxHeightGps = 2487;
  const expectMaxSink = -4.3;
  const expectMaxClimb = 5.4;
  const expectMaxSpeed = 78.68;
  const expectFixClimb = -0.1;
  const expectFixSpeed = 8.21;

  // Values for TIME_FRAME = 30
  // const expectMaxSink = -6.6;
  // const expectMaxClimb = 5.7;
  // const expectMaxSpeed = 83.94;
  // const expectFixClimb = 0.4;
  // const expectFixSpeed = 19.44;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[234].climb).toBe(expectFixClimb);
  expect(fixesStats[234].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

test("Check if stats are correct for a flight with a fixes resolution of 1s and some undefined altitude data", () => {
  const fixes = retrieveIgcFixes("kai_flat", "drei_97km16_6h15m.igc");

  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.execute(fixes);

  const expectMinHeightBaro = 35;
  const expectMaxHeightBaro = 1939;
  const expectMinHeightGps = 97;
  const expectMaxHeightGps = 2011;
  const expectMaxSink = -3.5;
  const expectMaxClimb = 3.8;
  const expectMaxSpeed = 60.46;
  const expectFixClimb = -0.2;
  const expectFixSpeed = 14.07;

  // Values for TIME_FRAME = 30
  // const expectMaxSink = -12.1;
  // const expectMaxClimb = 13.9;
  // const expectMaxSpeed = 61.96;
  // const expectFixSpeed = 24.94;

  expect(minHeightBaro).toBe(expectMinHeightBaro);
  expect(maxHeightBaro).toBe(expectMaxHeightBaro);
  expect(minHeightGps).toBe(expectMinHeightGps);
  expect(maxHeightGps).toBe(expectMaxHeightGps);
  expect(maxSink).toBe(expectMaxSink);
  expect(maxClimb).toBe(expectMaxClimb);
  expect(maxSpeed).toBe(expectMaxSpeed);

  expect(fixesStats[234].climb).toBe(expectFixClimb);
  expect(fixesStats[234].speed).toBe(expectFixSpeed);

  expect(fixesStats.length).toBe(fixes.length);
});

function createFixesWithConstantClimb(
  flightDurationInSeconds,
  resolutionOfFixesInSeconds,
  constantClimbInMeterPerSecond,
  gpsOffsetInMeters,
  startAltitude = 0
) {
  const fixes = [];
  const numberOfFixes = flightDurationInSeconds / resolutionOfFixesInSeconds;
  const startTimestamp = moment();

  for (let index = 0; index < numberOfFixes; index++) {
    const newAltitude =
      startAltitude +
      index * constantClimbInMeterPerSecond * resolutionOfFixesInSeconds;

    fixes.push({
      timestamp:
        startTimestamp.add(resolutionOfFixesInSeconds, "seconds").unix() * 1000,
      latitude: 123456,
      longitude: 123456,
      pressureAltitude: newAltitude,
      gpsAltitude: newAltitude + gpsOffsetInMeters,
    });
  }

  return fixes;
}
