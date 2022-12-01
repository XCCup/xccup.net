import { FlightOutputAttributes } from "../db/models/Flight";
import service from "./ResultService";
import db from "../db";
import { logger } from "bs-logger";
import config from "../config/env-config";

interface TypeRecord {
  user: {
    firstName?: string;
    lastName?: string;
    id?: string;
  };
  flightId: string;
  externalId: number;
  takeoffTime: number;
  points: number;
  distance: number;
  glider: {
    brand: string;
    model: string;
    gliderClass: {
      key: string;
      shortDescription: string;
    };
  };
}

interface SiteRecord {
  takeoff: {
    id: string;
    name: string;
    shortName: string;
  };
  free?: TypeRecord;
  flat?: TypeRecord;
  fai?: TypeRecord;
}

let siteRecordsCache: SiteRecord[];

export async function checkSiteRecordsAndUpdate(
  flight: FlightOutputAttributes
) {
  const found = (await getSiteRecords()).find(
    (r) => r.takeoff.id == flight.siteId
  );
  if (found) {
    switch (flight.flightType) {
      case "FREE":
        const possibleNewRecorda = await createNewRecordIfNeeded(
          found.free,
          flight
        );
        if (possibleNewRecorda) found.free = possibleNewRecorda;
        break;
      case "FLAT":
        const possibleNewRecordb = await createNewRecordIfNeeded(
          found.flat,
          flight
        );
        if (possibleNewRecordb) found.flat = possibleNewRecordb;
        break;
      case "FAI":
        const possibleNewRecordc = await createNewRecordIfNeeded(
          found.fai,
          flight
        );
        if (possibleNewRecordc) found.fai = possibleNewRecordc;
        break;
      default:
        break;
    }
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
  if (siteRecordsCache) return siteRecordsCache;

  siteRecordsCache = <SiteRecord[]>await service.getSiteRecords();
  return siteRecordsCache;
}

(() => {
  if (config.get("env") === "production") {
    setTimeout(() => {
      logger.info("SRC: Fill site records cache on server start-up");
      getSiteRecords();
    }, 10_000);
  }
})();
