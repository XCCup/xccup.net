/**
 * @jest-environment node
 */
import { convertVerticalLimitToMeterMSL } from "../helper/AirspaceHeightConverter";

test.each([
  ["3500F MSL", 1066.8],
  ["3500FT MSL", 1066.8],
  ["3500F AMSL", 1066.8],
  ["3500FT AMSL", 1066.8],
  ["3500f MSL", 1066.8],
  ["3500ft MSL", 1066.8],
  ["3500ft AMSL", 1066.8],
  ["3500ft AMSL", 1066.8],
])("Convert MSL value %s to %i", (value, expected) => {
  const converted = convertVerticalLimitToMeterMSL(value, 0);
  expect(converted).toBe(expected);
});

test.each([
  ["3500F AGL", 1066.8],
  ["3500FT AGL", 1066.8],
  ["3500f AGL", 1066.8],
  ["3500ft AGL", 1066.8],
])("Convert AGL value %s to %i", (value, expected) => {
  const converted = convertVerticalLimitToMeterMSL(value, 0);
  expect(converted).toBe(expected);
});

test.each([
  ["FL100", 3048],
  ["FL 80", 2438.4],
])("Convert FL value %s to %i", (value, expected) => {
  const converted = convertVerticalLimitToMeterMSL(value, 0);
  expect(converted).toBe(expected);
});

test.each([
  ["3500F AGL", 100, 1166.8],
  ["3500FT AGL", 200, 1266.8],
  ["3500 F AGL", 100, 1166.8],
  ["3500 FT AGL", 200, 1266.8],
  ["3500f AGL", 300, 1366.8],
  ["3500ft AGL", 400, 1466.8],
  ["3500 f AGL", 300, 1366.8],
  ["3500 ft AGL", 400, 1466.8],
])(
  "Convert AGL value %s with elevation %i to %i",
  (value, elevation, expected) => {
    const converted = convertVerticalLimitToMeterMSL(value, elevation);
    expect(converted).toBe(expected);
  }
);

test.each([
  ["GND", 100, 100],
  ["GND", 0, 0],
  ["1500F GND", 0, 0],
  ["1500F GND", 42, 42],
])(
  "Convert GND value %s with elevation %i to %i",
  (value, elevation, expected) => {
    const converted = convertVerticalLimitToMeterMSL(value, elevation);
    expect(converted).toBe(expected);
  }
);

test("No number at all should throw an error", () => {
  expect(() => {
    convertVerticalLimitToMeterMSL("foobar MSL", 0);
  }).toThrow("Couldn't convert airspace height information of");
});
