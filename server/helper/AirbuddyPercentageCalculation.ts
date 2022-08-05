const MAX_PER_DISTANCE = 250;
const END_DISTANCE = MAX_PER_DISTANCE * 10;

export function calcSingleAirbuddyPercentage(distance: number) {
  return distance < MAX_PER_DISTANCE
    ? 100
    : distance > END_DISTANCE
    ? 0
    : calcInBetweenValue(distance);
}

function calcInBetweenValue(distance: number) {
  return Math.abs((distance / END_DISTANCE - 0.1) * 100 - 100);
}
