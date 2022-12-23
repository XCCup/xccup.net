import { Client, ElevationResponse } from "@googlemaps/google-maps-services-js";
import config from "../config/env-config";
import logger from "../config/logger";
import { FlightFixTimeAndHeights } from "../types/FlightFixes";

interface LatLng {
  lat: number;
  lng: number;
}

interface Fix {
  latitude: number;
  longitude: number;
  elevation?: number;
}

const client = new Client();

const GOOGLE_MAPS_API_KEY = config.get("googleMapsApiKey");
const MAX_FIX_DECIMALS = 5;
const NUMBER_OF_FIXES_PER_REQUEST = 400;

/**
 * Returns the GND elevation for every fix in an array via Google Maps API
 * After creating an array with the correct structure we split up the fixes
 * in smaller chunks and create a promise for each chunk. (Because of API limitation)
 * After resolving them all in parallel the results are combined to a single array.
 * @param fixes
 * @returns
 */
export async function getElevationData(fixes: Fix[]) {
  logger.info(
    "EA: Will request elevation data in chunks of " +
      NUMBER_OF_FIXES_PER_REQUEST
  );

  const locations = formatFixes(fixes);
  const chunks = createLocationChunks(locations, NUMBER_OF_FIXES_PER_REQUEST);
  const promises = createGoogleRequests(chunks);

  const res = await Promise.all(promises);
  const elevations = combineElevationChunks(res);
  logger.info("EA: Finished retrieving elevation data");

  return elevations;
}

export function addElevationToFixes(
  fixes: FlightFixTimeAndHeights[],
  elevations: number[]
) {
  if (fixes.length !== elevations.length)
    throw new Error(
      `EA: Number of fixes and elevations does not match ${fixes.length}/${elevations.length}`
    );

  for (let i = 0; i < fixes.length; i++) {
    fixes[i].elevation = elevations[i];
  }
}

/**
 * Logs errors depending on error type and returns error
 * @param error
 * @returns
 */
export function logElevationError(error: any) {
  let errorMessage;
  if (error.message) errorMessage = error.message;
  if (error?.response?.data) errorMessage = error.response.data;
  else errorMessage = error;

  logger.error("EA: Error while fetching elevation data: " + errorMessage);
  return errorMessage;
}

function formatFixes(fixes: Fix[]): LatLng[] {
  const locations = fixes.map((fix) => {
    return {
      lat: maxDecimals(fix.latitude, MAX_FIX_DECIMALS),
      lng: maxDecimals(fix.longitude, MAX_FIX_DECIMALS),
    };
  });
  return locations;
}

function maxDecimals(number: number | string, maxDecimals: number) {
  const num = +number; // Make sure we continue with a number
  return parseFloat(num.toFixed(maxDecimals));
}

function createGoogleRequests(chunks: LatLng[][]) {
  const promises = [];
  for (let i = 0; i < chunks.length; i++) {
    const promise = client.elevation({
      params: {
        locations: chunks[i],
        key: GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });
    promises.push(promise);
  }
  return promises;
}

function createLocationChunks(locations: LatLng[], size: number) {
  const _locations = [...locations];
  const chunks: LatLng[][] = [];

  while (_locations.length) {
    chunks.push(_locations.splice(0, size));
  }
  return chunks;
}

function combineElevationChunks(chunks: ElevationResponse[]) {
  const elevations: number[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const elevationResultsOfSingleRequest = chunks[i].data.results.flatMap(
      (el) => Math.round(el.elevation)
    );
    elevations.push(...elevationResultsOfSingleRequest);
  }
  return elevations;
}
