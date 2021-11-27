const { expect } = require("@jest/globals");
const {
  isEaster,
  isCorpusChristi,
  isPentecost,
  isHoliday,
  isAscension,
  isNoWorkday,
} = require("../helper/HolidayCalculator");

/**
 * Eastern is meant as easter monday
 *
 */
const eastern2018 = new Date("2018-04-01 12:00:00+00");
const eastern2022 = new Date("2022-04-17 12:00:00+00");
const eastern2022after = new Date("2021-04-05 12:00:00+00");

const pentecost2021 = new Date("2021-05-23 12:00:00+00");
const pentecost2025 = new Date("2025-06-08 12:00:00+00");
const pentecost2029after = new Date("2029-05-21 12:00:00+00");

const chorpus2017 = new Date("2017-06-15 12:00:00+00");
const chorpus2019 = new Date("2019-06-20 12:00:00+00");
const chorpus2021before = new Date("2021-06-02 12:00:00+00");

const ascension2017 = new Date("2017-05-25 12:00:00+00");
const ascension2019 = new Date("2019-05-30 12:00:00+00");
const ascension2021after = new Date("2021-05-14 12:00:00+00");

const firstOfMay2680 = new Date("2680-05-01 12:00:00+00");

test("Check correct date of eastern in 2018", () => {
  expect(isEaster(eastern2018)).toBe(true);
});

test("Check correct date of eastern in 2022", () => {
  expect(isEaster(eastern2022)).toBe(true);
});

test("Check if one day before eastern in 2021 is false", () => {
  expect(isEaster(eastern2022after)).toBe(false);
});

test("Check correct date of pentecost in 2021", () => {
  expect(isPentecost(pentecost2021)).toBe(true);
});

test("Check correct date of pentecost in 2025", () => {
  expect(isPentecost(pentecost2025)).toBe(true);
});

test("Check if one day after pentecost in 2029 is false", () => {
  expect(isPentecost(pentecost2029after)).toBe(false);
});

test("Check correct date of chorpus chrisi in 2017", () => {
  expect(isCorpusChristi(chorpus2017)).toBe(true);
});

test("Check correct date of chorpus chrisi in 2019", () => {
  expect(isCorpusChristi(chorpus2019)).toBe(true);
});

test("Check if one day before chorpus chrisi in 2021 is false", () => {
  expect(isCorpusChristi(chorpus2021before)).toBe(false);
});

test("Check correct date of ascension in 2017", () => {
  expect(isAscension(ascension2017)).toBe(true);
});

test("Check correct date of ascension in 2019", () => {
  expect(isAscension(ascension2019)).toBe(true);
});

test("Check if one day before ascension in 2021 is false", () => {
  expect(isAscension(ascension2021after)).toBe(false);
});

test("Check correct date of chorpus chrisi in 2017 (isHoliday()-Function)", () => {
  expect(isHoliday(chorpus2017)).toBe(true);
});

test("Check correct date of pentecost in 2021 (isHoliday()-Function)", () => {
  expect(isHoliday(pentecost2021)).toBe(true);
});

test("Check correct date of easter in 2022 (isHoliday()-Function)", () => {
  expect(isHoliday(eastern2022)).toBe(true);
});

test("Check correct date of ascension in 2022 (isHoliday()-Function)", () => {
  expect(isHoliday(ascension2019)).toBe(true);
});

test("Check correct date of first of may 2680 (isHoliday()-Function)", () => {
  expect(isHoliday(firstOfMay2680)).toBe(true);
});

test("Check date is no holiday)", () => {
  expect(isHoliday(new Date("2111-11-11 11:11:11+00"))).toBe(false);
});

test("Check incomplete date is false)", () => {
  expect(isNoWorkday("2021-11")).toBe(false);
});

test("Check invalid date is false)", () => {
  expect(isNoWorkday("2021-13-13")).toBe(false);
});

test("Check empty date is false)", () => {
  expect(isNoWorkday("")).toBe(false);
});

test("Check no date is false)", () => {
  expect(isNoWorkday()).toBe(false);
});
