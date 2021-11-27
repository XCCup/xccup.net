const logger = require("../config/logger");

/**
 * The time frame in which speed and climb will be calculated
 */
const TIME_FRAME = 30;

function execute(fixes) {
  logger.debug("Start flight stats calculation");

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
  // Baro data is the preferred option because of accurrucy.
  // If no baro data is available switch to gps data.
  const noBaro =
    fixes[0].pressureAltitude && fixes[fixes.length - 1].pressureAltitude;
  const heightDifferenceFunction = noBaro
    ? gpsHeightDifference
    : pressureHeightDifference;

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

    const climb = Math.round((climbedHeight / timeDeltaInSeconds) * 10) / 10;
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
    if (speed > maxSpeed) maxSpeed = speed;
  }

  logger.debug("Finished flight stats calculation");

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

function pressureHeightDifference(current, precessor) {
  return current.pressureAltitude - precessor.pressureAltitude;
}

function gpsHeightDifference(current, precessor) {
  return current.gpsAltitude - precessor.gpsAltitude;
}

function FixStat(climb, speed) {
  this.climb = climb;
  this.speed = speed;
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
function calculateDistance(fix1, fix2) {
  const y = fix2.longitude - fix1.longitude;
  const x = fix2.latitude - fix1.latitude;

  const distanceInDegree = Math.sqrt(x * x + y * y);

  return distanceInDegree * DEGREE_DIST;
}

function calculateSpeed(current, precessor, timeDeltaInSeconds) {
  return (
    Math.round(
      (calculateDistance(current, precessor) / timeDeltaInSeconds) * 360
    ) / 100
  );
}

function executeOnFlightFixes(flightFixes) {
  const fixes = [];

  for (let index = 0; index < flightFixes.geom.coordinates.length; index++) {
    fixes.push({
      pressureAltitude: flightFixes.timeAndHeights[index].pressureAltitude,
      gpsAltitude: flightFixes.timeAndHeights[index].gpsAltitude,
      timestamp: flightFixes.timeAndHeights[index].timestamp,
      latitude: flightFixes.geom.coordinates[index][1],
      longitude: flightFixes.geom.coordinates[index][0],
    });
  }

  return execute(fixes);
}

exports.execute = execute;
exports.executeOnFlightFixes = executeOnFlightFixes;
