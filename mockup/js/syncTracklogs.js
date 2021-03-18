// Unused

let syncedFlights = [];

const syncFlights = () => {
  console.log("syncFlights");
  // Check which flight landed latest
  let latestLanding = 0;
  if (
    flightData1.fixes[flightData1.fixes.length - 1] >
    flightData2.fixes[flightData2.fixes.length - 1]
  ) {
    latestLanding = flightData1.fixes[flightData1.fixes.length - 1].timestamp;
  } else {
    latestLanding = flightData2.fixes[flightData2.fixes.length - 1].timestamp;
  }
  console.log(latestLanding);

  // Check which flight started earlier
  if (flightData1.fixes[0].timestamp > flightData2.fixes[0].timestamp) {
    let dif = flightData1.fixes[0].timestamp - flightData2.fixes[0].timestamp;
    console.log(dif);
    for (
      var i = 0;
      i < latestLanding / 1000 - flightData2.fixes[0].timestamp / 1000;
      i++
    ) {
      let found1;
      found1 = flightData1.fixes.find(
        (element) =>
          element.timestamp / 1000 === flightData2.fixes[0].timestamp / 1000 + i
      );

      if (found1 === undefined) {
        found1 = NaN;
      }

      let found2;
      found2 = flightData2.fixes.find(
        (element) =>
          element.timestamp / 1000 === flightData2.fixes[0].timestamp / 1000 + i
      );

      if (found2 === undefined) {
        found2 = NaN;
      }

      syncedFlights.push({
        timestamp: flightData2.fixes[0].timestamp / 1000 + i,
        flight1: {
          lat: found1.latitude,
          long: found1.longitude,
          alt: found1.gpsAltitude,
        },
        flight2: {
          lat: found2.latitude,
          long: found2.longitude,
          alt: found2.gpsAltitude,
        },
      });
    }
    console.log("done");
    console.log(syncedFlights);
  }
};
