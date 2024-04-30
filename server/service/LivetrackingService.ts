import axios from "axios";
import NodeCache from "node-cache";
import db from "../db";
import sequelize from "sequelize";
import logger from "../config/logger";
import cron from "node-cron";
import config from "../config/env-config";

const FLARM_URL = config.get("flarmUrl");
const FLARM_API_KEY = config.get("flarmApiKey");
const FLARM_USER_IDS_KEY = "user-flarm-ids";

const IGC_XC_SCORE_HOST = config.get("igcXcScoreHost");

const CACHE_INDEFINITELY = 0;
const CACHE_10_MINUTES = 600;

const cache = new NodeCache({ stdTTL: CACHE_10_MINUTES });

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
  distance?: number;
  fixes: FlightData[];
}[];

/**
 * The service fetches FLARM data every minute for every user that provided a FLARM ID.
 * All tracks are reduced to a resolution of 10 seconds and the result is cached for 10 minutes.
 * To minimize latency the service only returns cached values and never waits for the FLARM API.
 * If the fetch would fail an empty array is returned.
 * The endpoint only returns fixes within the XCCup area and flights that had a live position less then 30 minutes ago.
 */

const TRACK_RESOLUTION = 10; // 10 seconds (s not ms)
const TRACK_RESOLUTION_HOME = 60; // 60 seconds (s not ms)

// Run the job every 60 seconds between 8 in the morning and 9 in the evening
const task = cron.schedule("* 8-21 * * *", fetchFlarmData);
task.start();

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
        track: reduceResolution(flight.fixes, TRACK_RESOLUTION_HOME).map(
          (fix) => {
            return {
              lat: fix.lat,
              long: fix.lon,
              timestamp: fix.timestamp * 1000,
            };
          }
        ),
      };
    });
  },
  flushFlarmIdCache: () => {
    logger.info("LTS: Flushing user FLARM ID cache");
    return cache.del(FLARM_USER_IDS_KEY);
  },
};

async function fetchFlarmData() {
  try {
    logger.debug("LT: Fetching FLARM data");

    const idsWithNames = await getUserFlarmIds();
    const ids = idsWithNames.map((user) => user.flarmId);

    const url = `${FLARM_URL}/${ids.join(",")}`;

    const { data } = await axios.get<ResponseType>(url, {
      headers: { "API-Key": FLARM_API_KEY },
    });

    logger.debug(`LT: Active FLARM IDs: ${Object.keys(data.tracks)}`);

    // Reduce resolution to 10 seconds and add pilot name and distance

    const reduced = await Promise.all(
      Object.keys(data.tracks).map(async (key) => {
        const reducedFixes = reduceResolution(
          data.tracks[key],
          TRACK_RESOLUTION
        );
        return {
          name: idsWithNames.find((user) => user.flarmId === key)?.name || key,
          distance: await calculateLiveTrackDistance(reducedFixes),
          fixes: reducedFixes,
        };
      })
    );

    // Filter out flights with unrealistically high distances (FLARM not updated)
    const filtered = reduced.filter(
      (flight) => typeof flight.distance === "number" && flight.distance < 900
    );

    cache.set<ReducedFlightData>("flarm", filtered);
  } catch (error) {
    logger.error(error);
  }
}

async function calculateLiveTrackDistance(fixes: FlightData[]) {
  const transformedFixes = fixes.map((fix) => ({
    timestamp: fix.timestamp,
    latitude: fix.lat,
    longitude: fix.lon,
    valid: true,
  }));

  if (transformedFixes.length < 8) return;

  try {
    const { data } = await axios.post(
      `http://${IGC_XC_SCORE_HOST}:3030`,
      transformedFixes
    );

    if (typeof data === "number") return data;
  } catch (error) {
    logger.error("LT: Failed to calculate live track distance");
    logger.error(error);
  }
  return;
}

function reduceResolution(array: FlightData[], resolution: number) {
  let last: null | number = null;
  return array.filter((item) => {
    if (last === null || item.timestamp - last >= resolution) {
      last = item.timestamp;
      return true;
    }
    return false;
  });
}

type FlarmIdWithName = {
  flarmId: string | null | undefined;
  name: string;
};

async function getUserFlarmIds(): Promise<FlarmIdWithName[]> {
  const cached = cache.get<FlarmIdWithName[]>(FLARM_USER_IDS_KEY);

  if (cached) return cached;

  const ids = await db.User.findAll({
    where: { flarmId: { [sequelize.Op.not]: null } },
    attributes: ["flarmId", "firstName", "lastName"],
  });

  const arrangedIds = ids.map((user) => {
    return {
      flarmId: user.flarmId,
      name: `${user.firstName} ${user.lastName}`,
    };
  });
  cache.set(FLARM_USER_IDS_KEY, arrangedIds, CACHE_INDEFINITELY);
  return arrangedIds;
}

module.exports = service;
export default service;
