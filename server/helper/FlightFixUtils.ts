import {
  FlightFixTimeAndHeights,
  FlightFixCombined,
  FlightFixesAttributes,
} from "../types/FlightFixes";
import { LineString } from "geojson";
import IGCParser from "../helper/igc-parser";

/**
 * This method creates and GeoJSON LineString representation from the B records.
 * It's important that the track is stored into a seperate GeoJSON entity to use PostGIS functions on it.
 *
 * @param fixes The fixes parsed from the IGCParser
 * @returns An array of FlightFixTimeAndHeights objects
 */
export function createGeometry(fixes: FlightFixCombined[]): LineString {
  const coordinates = fixes.map((fix) => {
    return [fix.longitude, fix.latitude];
  });

  return {
    type: "LineString",
    coordinates,
  };
}

/**
 * This method filters the relevant information from the B records.
 *
 * @param fixes The fixes parsed from the IGCParser
 * @returns An array of FlightFixTimeAndHeights objects
 */
export function extractTimeAndHeights(
  fixes: FlightFixCombined[]
): FlightFixTimeAndHeights[] {
  return fixes.map((fix) => {
    return {
      timestamp: fix.timestamp,
      time: fix.time,
      pressureAltitude: fix.pressureAltitude,
      gpsAltitude: fix.gpsAltitude,
    };
  });
}

/**
 * Combines all properties from the flight fixes database object into a single property
 * to synchronize the access via index on these different arrays.
 *
 * @param fixesRef The fixes object from the database
 * @returns An array of FlightFixCombined objects
 */
export function combineFixesProperties(fixesRef: FlightFixesAttributes) {
  if (!fixesRef) return [];

  const coordinates = fixesRef.geom.coordinates;
  const timeAndHeights = fixesRef.timeAndHeights;
  const stats = fixesRef.stats;

  const resData: FlightFixCombined[] = [];
  for (let i = 0; i < timeAndHeights.length; i++) {
    // TODO: Spread this more elegant
    const fixData = {
      longitude: coordinates[i][0],
      latitude: coordinates[i][1],
      speed: stats ? stats[i].speed : undefined,
      climb: stats ? stats[i].climb : undefined,
      timestamp: timeAndHeights[i].timestamp,
      time: timeAndHeights[i].time,
      pressureAltitude: timeAndHeights[i].pressureAltitude,
      gpsAltitude: timeAndHeights[i].gpsAltitude,
      elevation: timeAndHeights[i].elevation,
    };
    resData.push(fixData);
  }

  return resData;
}
