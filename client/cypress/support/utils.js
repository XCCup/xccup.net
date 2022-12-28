const { isAfter, isBefore } = require("date-fns");

export function isInSeason() {
  const today = new Date();
  return (
    isAfter(today, new Date(`${today.getFullYear()}-03-01`)) &&
    isBefore(today, new Date(`${today.getFullYear()}-10-01`))
  );
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
