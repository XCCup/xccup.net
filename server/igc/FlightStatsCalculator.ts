import type { BRecord } from "../helper/igc-parser";
import logger from "../config/logger";

/**
 * The time frame in which speed and climb will be calculated
 */
const TIME_FRAME = 45;

function execute(fixes: BRecord[]) {
  logger.debug("FSC: Start flight stats calculation");

  if (!fixes[0] || !fixes[1]) {
    logger.warn("FSC: Fixes are undefined");
    return {};
  }

  const resolution = (fixes[1].timestamp - fixes[0].timestamp) / 1000;
  const step = Math.ceil(TIME_FRAME / resolution);

  let minHeightBaro = fixes[0].pressureAltitude ? fixes[0].pressureAltitude : 0;
  let maxHeightBaro = fixes[0].pressureAltitude ? fixes[0].pressureAltitude : 0;
  let minHeightGps = fixes[0].gpsAltitude ? fixes[0].gpsAltitude : 0;
  let maxHeightGps = fixes[0].gpsAltitude ? fixes[0].gpsAltitude : 0;
  let maxSink = 0.0;
  let maxClimb = 0.0;
  let maxSpeed = 0.0;
  const fixesStats = [new FixStat(0, 0)];

  // It's possible that some igc files have no baro data.
  // Baro data is the preferred option because of accurracy.
  // If no baro data is available switch to gps data.
  const hasBaro =
    fixes[0].pressureAltitude && fixes[fixes.length - 1].pressureAltitude;
  const heightDifferenceFunction = hasBaro
    ? pressureHeightDifference
    : gpsHeightDifference;

  for (let index = 1; index < step; index++) {
    //Fill gaps at the start
    fixesStats.push(new FixStat(0, 0));
  }

  for (let index = step; index < fixes.length; index++) {
    const current = fixes[index];
    const precessorIndex = index - step;
    const precessor = fixes[precessorIndex];

    const climbedHeight = heightDifferenceFunction(current, precessor);
    const timeDeltaInSeconds = (current.timestamp - precessor.timestamp) / 1000;

    const climb =
      Math.round(((climbedHeight ?? 0) / timeDeltaInSeconds) * 10) / 10;
    const speed = calculateSpeed(current, precessor, timeDeltaInSeconds);

    fixesStats.push(new FixStat(climb, speed));

    if (current.pressureAltitude && current.pressureAltitude < minHeightBaro)
      minHeightBaro = current.pressureAltitude;
    if (current.pressureAltitude && current.pressureAltitude > maxHeightBaro)
      maxHeightBaro = current.pressureAltitude;
    if (current.gpsAltitude && current.gpsAltitude < minHeightGps)
      minHeightGps = current.gpsAltitude;
    if (current.gpsAltitude && current.gpsAltitude > maxHeightGps)
      maxHeightGps = current.gpsAltitude;
    if (climb < maxSink) maxSink = climb;
    if (climb > maxClimb) maxClimb = climb;
    if (
      (speed > maxSpeed && speed < maxSpeed * 1.2) ||
      (speed > maxSpeed && speed > 0 && speed < 50)
    )
      maxSpeed = speed;
  }

  logger.debug("FSC: Finished flight stats calculation");

  return {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  };
}

function pressureHeightDifference(current: BRecord, precessor: BRecord) {
  if (current.pressureAltitude && precessor.pressureAltitude) {
    return current.pressureAltitude - precessor.pressureAltitude;
  }
}

function gpsHeightDifference(current: BRecord, precessor: BRecord) {
  if (current.gpsAltitude && precessor.gpsAltitude) {
    return current.gpsAltitude - precessor.gpsAltitude;
  }
}

class FixStat {
  climb: number;
  speed: number;
  constructor(climb: number, speed: number) {
    this.climb = climb;
    this.speed = speed;
  }
}

/**
 * The average distance in m of one degree in the vicinity of the center mosel valley
 */
const DEGREE_DIST = 95_000;

/**
 * This function calculates the distance between two coordinates.
 * This is just a rapid approximation and doesn't take into account that the earth is round.
 * Because of the normally short distances between the two coordinates this function should be sufficent.
 * @param {*} fix1
 * @param {*} fix2
 * @returns The distance in meters between the two coordinates.
 */
function calculateDistance(fix1: BRecord, fix2: BRecord) {
  const y = fix2.longitude - fix1.longitude;
  const x = fix2.latitude - fix1.latitude;

  const distanceInDegree = Math.sqrt(x * x + y * y);

  return distanceInDegree * DEGREE_DIST;
}

export function calculateSpeed(
  current: BRecord,
  precessor: BRecord,
  timeDeltaInSeconds: number
) {
  return (
    Math.round(
      (calculateDistance(current, precessor) / timeDeltaInSeconds) * 360
    ) / 100
  );
}

exports.execute = execute;
exports.calculateSpeed = calculateSpeed;
