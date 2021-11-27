/**
 * @jest-environment node
 */
const Helper = require("./IgcTestHelper");
const IGCParser = require("igc-parser");

function retrieveIgcFixes(folder, file) {
  const igcAsPlainText = Helper.readIgcFile(folder, file);
  return IGCParser.parse(igcAsPlainText, { lenient: true }).fixes;
}

const FlightStatsCalculator = require("../igc/FlightStatsCalculator");

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
  const expectMaxSink = -4;
  const expectMaxClimb = 4;
  const expectMaxSpeed = 63.61;
  const expectFixClimb = 2.1;
  const expectFixSpeed = 34.01;

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
  const expectMaxSink = -6.6;
  const expectMaxClimb = 5.7;
  const expectMaxSpeed = 83.94;
  const expectFixClimb = 0.4;
  const expectFixSpeed = 19.44;

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
  const expectMaxSink = -12.1;
  const expectMaxClimb = 13.9;
  const expectMaxSpeed = 61.96;
  const expectFixClimb = -0.2;
  const expectFixSpeed = 24.94;

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
