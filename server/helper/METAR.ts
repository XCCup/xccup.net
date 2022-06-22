import config from "../config/env-config";
import axios from "axios";
import type { FlightInstance } from "../db/models/Flight";
import type { FlightFixesCombined } from "../types/FlightFixes";

/** *
 * Fetches METAR data for every 20 minutes of the flight from the nearest
 * METAR station for the given fix and saves it to the db.
 *
 * @param {Object} flight The db object of the flight
 * @param {Array} fixes
 */
export async function getMetarData(
  flight: FlightInstance,
  fixes?: FlightFixesCombined[]
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

  fixes.forEach((fix) => {
    const fixTime = new Date(fix.timestamp).valueOf();
    if (fixTime > takeOffTime + i && fixTime < landingTime) {
      axiosPromises.push(
        axios.get(METAR_URL, {
          params: {
            lat: fix.latitude,
            long: fix.longitude,
            date: new Date(fix.timestamp).toISOString(),
          },
          headers: { "API-Key": METAR_API_KEY },
        })
      );
      i += interval;
    }
  });

  // Last fix (landing)
  axiosPromises.push(
    axios.get(METAR_URL, {
      params: {
        lat: fixes[lastFix].latitude,
        long: fixes[lastFix].longitude,
        date: new Date(fixes[lastFix].timestamp).toISOString(),
      },
      headers: { "API-Key": METAR_API_KEY },
    })
  );

  const res = await axios.all(axiosPromises);
  try {
    const metarData = res.map((el) => {
      if (!el.data || el.data.data.length == 0)
        throw new Error("METAR request returned null");
      return el.data.data[0];
    });
    flight.flightMetarData = metarData;
    await flight.save();
  } catch {
    return null;
  }
}

exports.getMetarData = getMetarData;
