const {
  calcSingleAirbuddyPercentage,
} = require("../helper/AirbuddyPercentageCalculation");

test("Below 250m there should be no more than 100%", () => {
  expect(calcSingleAirbuddyPercentage(42)).toBe(100);
});

test("Above 2500m the result should be 0", () => {
  expect(calcSingleAirbuddyPercentage(2501)).toBe(0);
});

test("250m should result to 100", () => {
  expect(calcSingleAirbuddyPercentage(250)).toBe(100);
});

test("500m should result to 90", () => {
  expect(calcSingleAirbuddyPercentage(500)).toBe(90);
});
test("1250m should result to 60", () => {
  expect(calcSingleAirbuddyPercentage(1250)).toBe(60);
});

test("2000m should result to 30", () => {
  expect(calcSingleAirbuddyPercentage(2000)).toBe(30);
});

test("2500m should result to 10", () => {
  expect(calcSingleAirbuddyPercentage(2500)).toBe(10);
});
