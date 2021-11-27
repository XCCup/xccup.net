import trackColors from "@/assets/js/trackColors.js";

// Process tracklog data for barogramm
export function processBaroData(flight, buddyTracks) {
  const allBaroData = [];
  const baroData = [];
  const elevation = [];
  if (!flight) return null;
  for (var i = 0; i < flight.fixes.length; i++) {
    elevation.push({
      x: flight.fixes[i].timestamp,
      y: flight.fixes[i].elevation,
    });
    baroData.push({
      x: flight.fixes[i].timestamp,
      y: flight.fixes[i].gpsAltitude,
    });
  }
  let hideGND = false;
  // Check if any buddy track is activated. If so: Hide the GND dataset
  // Maybe this can be done smarter
  if (buddyTracks) {
    buddyTracks.forEach((element) => {
      if (element.isActive) {
        hideGND = true;
      }
    });
  }
  // Dataset for elevation graph (GND)
  allBaroData[0] = {
    label: "GND",
    hidden: hideGND,
    fill: true,
    data: elevation,
    backgroundColor: "SaddleBrown",
    borderColor: "SaddleBrown",
  };
  // Dataset for main flight
  allBaroData[1] = {
    label: "Pilot 1",
    data: baroData,
    backgroundColor: trackColors[0],
    borderColor: trackColors[0],
  };
  // Datasets for all aribuddies
  if (buddyTracks) {
    buddyTracks.forEach((element, index) => {
      const buddyBaro = [];
      // Check if this track is activated
      if (element.isActive) {
        for (var i = 0; i < element.fixes.length; i++) {
          buddyBaro.push([
            element.fixes[i].timestamp,
            element.fixes[i].gpsAltitude,
          ]);
        }
      }
      // Create the buddy dataset
      allBaroData[index + 2] = {
        label: element.buddyName,
        data: buddyBaro,
        backgroundColor: trackColors[index + 1],
        borderColor: trackColors[index + 1],
      };
    });
  }
  return allBaroData;
}
