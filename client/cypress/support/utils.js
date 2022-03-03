const { isAfter, isBefore } = require("date-fns");

export function isInSeason() {
  const today = new Date();
  return (
    isAfter(today, new Date(`${today.getFullYear()}-03-01`)) &&
    isBefore(today, new Date(`${today.getFullYear()}-10-01`))
  );
}
