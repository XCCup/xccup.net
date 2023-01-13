import { FlightOutputAttributes } from "../db/models/Flight";
import service from "./ResultService";
import db from "../db";
import { logger } from "bs-logger";
import config from "../config/env-config";
import { cache } from "../controller/CacheManager";
import { SiteRecord, TypeRecord } from "../types/ResultTypes";

const SITE_RECORD_CACHE_KEY = "site-record-cache";

export async function checkSiteRecordsAndUpdate(
  flight: FlightOutputAttributes
) {
  const currentRecords = await getSiteRecords();

  const found = currentRecords.find((r) => r.takeoff.id == flight.siteId);
  if (found) {
    const typeRecordPropertyName = flight.flightType?.toLowerCase() as
      | "free"
      | "flat"
      | "fai";

    if (!typeRecordPropertyName) return;

    const possibleNewRecord = await createNewRecordIfNeeded(
      found[typeRecordPropertyName],
      flight
    );
    if (possibleNewRecord) found[typeRecordPropertyName] = possibleNewRecord;

    // Object in cache are immutable therefore we have to explicitly update the cache
    cache.set(SITE_RECORD_CACHE_KEY, currentRecords, 0);
  }
}

async function createNewRecordIfNeeded(
  typeRecord: TypeRecord | undefined,
  flight: FlightOutputAttributes
) {
  if (
    !flight.takeoffTime ||
    !flight.flightPoints ||
    !flight.externalId ||
    !flight.glider
  )
    return;

  if (
    flight.flightDistance &&
    (!typeRecord || flight.flightDistance > typeRecord.distance)
  ) {
    const user = await db.User.findByPk(flight.userId);

    logger.info("Create new record for flight " + flight.externalId);

    return {
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        id: user?.id,
      },
      flightId: flight.id,
      externalId: flight.externalId,
      takeoffTime: flight.takeoffTime,
      points: flight.flightPoints,
      distance: flight.flightDistance,
      glider: flight.glider,
    };
  }
}

export async function getSiteRecords() {
  if (cache.get(SITE_RECORD_CACHE_KEY))
    return cache.get(SITE_RECORD_CACHE_KEY) as SiteRecord[];

  const siteRecords = <SiteRecord[]>await service.getSiteRecords();

  // TTL=0 keeps site record in cave forever
  cache.set(SITE_RECORD_CACHE_KEY, siteRecords, 0);

  return siteRecords;
}

(() => {
  if (config.get("env") === "production") {
    setTimeout(() => {
      logger.info("SRC: Fill site records cache on server start-up");
      getSiteRecords();
    }, 10_000);
  }
})();
