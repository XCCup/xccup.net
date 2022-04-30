import {
  FlightFixTimeAndHeights,
  FlightFixesAttributes,
  FlightFixesCombined,
} from "../types/FlightFixesTypes";
import { LineString } from "geojson";
import IGCParser from "igc-parser";

/**
 * This method creates and GeoJSON LineString representation from the B records.
 * It's important that the track is stored into a seperate GeoJSON entity to use PostGIS functions on it.
 *
 * @param fixes The fixes parsed from the IGCParser
 * @returns An array of FlightFixTimeAndHeights objects
 */
export function createGeometry(fixes: IGCParser.BRecord[]): LineString {
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
  fixes: IGCParser.BRecord[]
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
 * Combines all properties from the flight fixes database object into a single property to synchronize the access via index on these different arrays.
 *
 * @param fixes The fixes object from the database
 * @returns An array of FlightFixesCombined objects
 */
export function combineFixesProperties(
  fixes: FlightFixesAttributes
): FlightFixesCombined[] {
  if (!fixes) return [];

  const coordinates = fixes.geom.coordinates;
  const timeAndHeights = fixes.timeAndHeights;
  const stats = fixes.stats;

  // @ts-ignore
  const newOb: FlightFixesCombined[] = [...timeAndHeights];

  for (let i = 0; i < timeAndHeights.length; i++) {
    newOb[i].longitude = coordinates[i][0];
    newOb[i].latitude = coordinates[i][1];
    if (stats) {
      newOb[i].speed = stats[i].speed;
      newOb[i].climb = stats[i].climb;
    }
  }
  return newOb;
}
