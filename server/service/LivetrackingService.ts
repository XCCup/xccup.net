import axios from "axios";
import NodeCache from "node-cache";
import config from "../config/env-config";
import db from "../db";
import sequelize from "sequelize";
import logger from "../config/logger";

const FLARM_URL = config.get("flarmUrl");
const FLARM_API_KEY = config.get("flarmApiKey");

const cache = new NodeCache({ stdTTL: 600 });

type FlightData = {
  address: string;
  timestamp: number;
  altitude: number;
  lon: number;
  lat: number;
};

type ResponseType = {
  tracks: { [key: string]: FlightData[] };
  distances: { [key: string]: number };
};

type ReducedFlightData = {
  name: string;
  distance: number;
  fixes: FlightData[];
}[];

/**
 * The service fetches FLARM data every minute for every user that provided a FLARM ID.
 * All tracks are reduced to a resolution of 10 seconds and the result is cached for 10 minutes.
 * To minimize latency the service only returns cached values and never waits for the FLARM API.
 * If the fetch would fail an empty array is returned.
 * The endpoint only returns fixes within the XCCup area and flights that had a live position less then 30 minutes ago.
 */

const FETCH_INTERVAL = 1000 * 60; // 60 seconds in ms
const TRACK_RESOLUTION = 10; // 10 seconds (s not ms)

fetchFlarmData();
setInterval(fetchFlarmData, FETCH_INTERVAL);

const service = {
  getActive: () => cache.get<ReducedFlightData>("flarm") || [],

  // FLARM data without fixes for home view
  getActiveDistances: () => {
    const cached = cache.get<ReducedFlightData>("flarm");
    if (!cached) return [];

    return cached.map((flight) => {
      return {
        user: { fullName: flight.name },
        flightDistance: flight.distance,
        id: flight.fixes[0].address,
        isLive: true,
      };
    });
  },
};

async function fetchFlarmData() {
  try {
    logger.info("LT: Fetching FLARM data");

    const idsWithNames = await getUserFlarmIds();
    const ids = idsWithNames.map((user) => user.flarmId);

    const url = `${FLARM_URL}/${ids.join(",")}`;

    const { data } = await axios.get<ResponseType>(url, {
      headers: { "API-Key": FLARM_API_KEY },
    });

    logger.info(`LT: Active FLARM IDs: ${Object.keys(data.tracks)}`);

    // Reduce resolution to 10 seconds and add pilot name and distance
    const reduced = Object.keys(data.tracks).map((key) => {
      let lastTimestamp: null | number = null;
      return {
        name: idsWithNames.find((user) => user.flarmId === key)?.name || key,
        distance: data.distances[key],
        fixes: data.tracks[key].filter((fix) => {
          if (
            lastTimestamp === null ||
            fix.timestamp - lastTimestamp >= TRACK_RESOLUTION
          ) {
            lastTimestamp = fix.timestamp;
            return true;
          }
          return false;
        }),
      };
    });

    cache.set<ReducedFlightData>("flarm", reduced);
  } catch (error) {
    console.log(error);
  }
}

async function getUserFlarmIds() {
  const ids = await db.User.findAll({
    where: { flarmId: { [sequelize.Op.not]: null } },
    attributes: ["flarmId", "firstName", "lastName"],
  });

  return ids.map((user) => {
    return {
      flarmId: user.flarmId,
      name: `${user.firstName} ${user.lastName}`,
    };
  });
}

module.exports = service;
export default service;
