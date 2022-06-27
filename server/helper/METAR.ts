import config from "../config/env-config";
import axios from "axios";
import type { FlightInstance } from "../db/models/Flight";
import type { FlightFixCombined } from "../types/FlightFixes";
import logger from "../config/logger";

/** *
 * Fetches METAR data for every 20 minutes of the flight from the nearest
 * METAR station for the given fix and saves it to the db.
 *
 * @param {Object} flight The db object of the flight
 * @param {Array} fixes
 */
export async function getMetarData(
  flight: FlightInstance,
  fixes?: FlightFixCombined[]
) {
  const axiosPromises = [];
  const METAR_URL = config.get("metarUrl");
  const METAR_API_KEY = config.get("metarApiKey");

  const interval = 60 * 20 * 1000; // 20 minutes
  let i = 0;
  if (!fixes?.length) throw new Error("No fixes found");

  const lastFix = fixes.length - 1;

  const takeOffTime = new Date(fixes[0].timestamp).valueOf();
  const landingTime = new Date(fixes[lastFix].timestamp).valueOf();

  function createMetarAxiosRequest(fix: FlightFixCombined) {
    return axios.get(METAR_URL, {
      params: {
        lat: fix.latitude,
        long: fix.longitude,
        date: new Date(fix.timestamp).toISOString(),
      },
      headers: { "API-Key": METAR_API_KEY },
    });
  }

  fixes.forEach((fix) => {
    const fixTime = new Date(fix.timestamp).valueOf();
    if (fixTime > takeOffTime + i && fixTime < landingTime) {
      axiosPromises.push(createMetarAxiosRequest(fix));
      i += interval;
    }
  });

  // Last fix (landing)
  axiosPromises.push(createMetarAxiosRequest(fixes[lastFix]));

  const res = await axios.all(axiosPromises);
  try {
    const metarData: string[] = res.map((el) => {
      if (!el.data || el.data.data.length == 0)
        throw new Error("METAR request returned null");
      return el.data.data[0];
    });
    flight.flightMetarData = metarData;
    await flight.save();
    return metarData;
  } catch (error) {
    logger.error("FS: METAR query error: " + error);
    return null;
  }
}

exports.getMetarData = getMetarData;
