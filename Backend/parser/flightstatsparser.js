const flights = require("../test/testdatasets/flights.json");
const fixes = require("../test/testdatasets/fixes.json");
const fs = require("fs");
const FlightStatsCalculator = require("../igc/FlightStatsCalculator");

fixes.forEach((e) => {
  const {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    fixesStats,
  } = FlightStatsCalculator.executeOnFlightFixes(e);

  const flight = flights.find((f) => f.id == e.flightId);
  console.log("F: ", flight.externalId);

  flight.airtime = Math.round(
    (e.timeAndHeights[e.timeAndHeights.length - 1].timestamp -
      e.timeAndHeights[0].timestamp) /
      60000
  );

  flight.flightStats = {
    minHeightBaro,
    maxHeightBaro,
    minHeightGps,
    maxHeightGps,
    maxSink,
    maxClimb,
    maxSpeed,
    taskSpeed: Math.round((flight.flightDistance / flight.airtime) * 600) / 10,
  };

  e.stats = fixesStats;
});

fs.writeFile(
  "flights2.json",
  JSON.stringify(flights, null, 2),
  "utf8",
  (err) => {
    console.log(err);
  }
);
fs.writeFile("fixes2.json", JSON.stringify(fixes, null, 2), "utf8", (err) => {
  console.log(err);
});
