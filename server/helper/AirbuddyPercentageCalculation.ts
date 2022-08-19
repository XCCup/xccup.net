/**
 * The distance between two pilots which will lead to the maximum percentage (100%) in correlation.
 * If pilots are closer they will not exceed 100%.
 */
const MAX_PERCENTAGE_DISTANCE = 250;
/**
 * The farest distance which will be considered for calculating the correlation percentage.
 */
const END_DISTANCE = MAX_PERCENTAGE_DISTANCE * 10;

export function calcSingleAirbuddyPercentage(distance: number) {
  return distance < MAX_PERCENTAGE_DISTANCE
    ? 100
    : distance > END_DISTANCE
    ? 0
    : calcInBetweenValue(distance);
}

function calcInBetweenValue(distance: number) {
  return Math.abs(
    (distance / END_DISTANCE - MAX_PERCENTAGE_DISTANCE / END_DISTANCE) * 100 -
      100
  );
}
