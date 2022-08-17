import { TRACK_COLORS } from "@/common/Constants";
import type { BuddyTrack } from "@/types/Airbuddy";
import type { Flight } from "@/types/Flight";
import type { ChartDataset } from "chart.js";

interface Options {
  usePressureAlt: boolean;
}

// Process tracklog data for barogramm
export function processBaroData(
  flight: Flight | null,
  buddyTracks: BuddyTrack[],
  options: Options
): ChartDataset<"line">[] {
  const chartData = [];
  const baroData = [];
  const elevation = [];
  if (!flight || !flight.fixes) return [];
  for (let i = 0; i < flight.fixes.length; i++) {
    elevation.push({
      x: flight.fixes[i].timestamp,
      y: flight.fixes[i].elevation,
    });
    baroData.push({
      x: flight.fixes[i].timestamp,
      y: options.usePressureAlt
        ? flight.fixes[i].pressureAltitude
        : flight.fixes[i].gpsAltitude,
      // This may seem duplicate but is needed for for the stats to update
      gpsAltitude: flight.fixes[i].gpsAltitude,
      pressureAltitude: flight.fixes[i].pressureAltitude,
      speed: flight.fixes[i].speed,
      climb: flight.fixes[i].climb,
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
  chartData[0] = {
    label: "GND",
    hidden: hideGND,
    fill: true,
    order: 10,
    data: elevation,
    backgroundColor: "SaddleBrown",
    borderColor: "SaddleBrown",
  };
  // Dataset for main flight
  chartData[1] = {
    label: "Pilot",
    data: baroData,
    backgroundColor: TRACK_COLORS[0],
    borderColor: TRACK_COLORS[0],
  };
  // Datasets for all aribuddies
  if (buddyTracks) {
    buddyTracks.forEach((element, index) => {
      const buddyBaro = [];
      // Check if this track is activated and has fixes
      if (element.isActive && element.fixes) {
        for (let i = 0; i < element.fixes.length; i++) {
          buddyBaro.push({
            x: element.fixes[i].timestamp,
            y: element.fixes[i].gpsAltitude,
            speed: element.fixes[i].speed,
            climb: element.fixes[i].climb,
          });
        }
      }
      // Create the buddy dataset
      chartData[index + 2] = {
        label: element.buddyName,
        data: buddyBaro,
        backgroundColor: TRACK_COLORS[index + 1],
        borderColor: TRACK_COLORS[index + 1],
      };
    });
  }
  return chartData;
}
