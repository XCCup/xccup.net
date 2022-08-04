import logger from "../config/logger";
import { FlightAttributes } from "../db/models/Flight";
import { FlightFixesInstance } from "../db/models/FlightFixes";
import { combineFixesProperties } from "../helper/FlightFixUtils";
import db from "../db";
import { inRange, mean } from "lodash";
import { FlightFixCombined } from "../types/FlightFixes";
import { calcSingleAirbuddyPercentage } from "../helper/AirbuddyPercentageCalculation";

const RESOLUTION_STEP = 100;

export async function findAirbuddies(
  flight: FlightAttributes,
  fixes: FlightFixesInstance
) {
  const startTime = new Date();
  logger.info("AF: Start airbuddy search");

  // Devide flight in 100 location points
  const combinedFixes = combineFixesProperties(fixes);
  const fixesStep = Math.floor(combinedFixes.length / RESOLUTION_STEP);
  logger.debug("AF: Will split fixes in steps of " + fixesStep);
  const minimizedFixes = [];
  for (let index = 0; index < combinedFixes.length; index += fixesStep) {
    minimizedFixes.push(combinedFixes[index]);
  }
  logger.debug(
    "AF: Number of entries in the minimized fixes array: " +
      minimizedFixes.length
  );

  const testTrackId = "d83c8405-1db2-4cd6-9f77-3fc2df5e225e";

  const otherTrack = await db.FlightFixes.findByPk(testTrackId);
  const otherTrackTimeRelatedFixes: {
    original: FlightFixCombined;
    other: FlightFixCombined;
  }[] = [];
  minimizedFixes.forEach((f) => {
    if (!otherTrack) return;
    const combinedOtherFixes = combineFixesProperties(otherTrack);
    const found = combinedOtherFixes.find((oF) =>
      inRange(oF.timestamp, f.timestamp - 5 * 1000, f.timestamp + 5 * 1000)
    );
    if (found) otherTrackTimeRelatedFixes.push({ original: f, other: found });
  });

  logger.debug(
    "AF: Number of entries in the related minimized fixes array: " +
      otherTrackTimeRelatedFixes.length
  );

  const percentages = await Promise.all(
    otherTrackTimeRelatedFixes.map(async (f) => {
      const queryString = createDistanceQueryString(f.original, f.other);
      const distance = (
        await db.sequelize.query(queryString, {
          plain: true,
        })
      )?.st_distancesphere as number;

      const percentage = calcSingleAirbuddyPercentage(distance);
      logger.debug("AF: DISTANCE: " + distance);
      logger.debug("AF: PERCENTAGE: " + percentage);
      return percentage;
    })
  );

  // Add for missing fixes 0 percentage
  for (
    let index = 0;
    index < minimizedFixes.length - otherTrackTimeRelatedFixes.length;
    index++
  ) {
    percentages.push(0);
  }

  logger.debug("AF: Result of percentages: " + percentages);

  // Calculate mean percentage value
  const meanValue = mean(percentages);

  logger.info(
    `AF: The flight ${flight.id} matches by ${meanValue}% with the flight ${testTrackId}`
  );

  const endTime = new Date();
  logger.info(
    "AF: It took " +
      (endTime.getTime() -
        startTime.getTime() +
        "ms to calc the airbuddy percentage")
  );
}

function createQueryToCalculateDistanceToClosestPointOnOtherTrack(
  trackId: string,
  longitude: number,
  latitude: number
) {
  return `
    SELECT ST_DistanceSphere(
        (SELECT ST_ClosestPoint(line,pt) AS closest_pt_on_line
            FROM 
                (SELECT ST_SetSRID(ST_MakePoint(${longitude},${latitude}),4326)::geometry As pt,
                (SELECT geom FROM "FlightFixes" where "id" = '${trackId}')::geometry As line
            ) As foo)
        ,ST_SetSRID(ST_MakePoint(${longitude},${latitude}),4326)
    )
    `;
}

function createDistanceQueryString(a: FlightFixCombined, b: FlightFixCombined) {
  return `
  SELECT ST_DistanceSphere(
    (SELECT ST_SetSRID(ST_MakePoint(${a.longitude},${a.latitude}),4326)::geometry),
    (SELECT ST_SetSRID(ST_MakePoint(${b.longitude},${b.latitude}),4326)::geometry))
    `;
}
// If found give it a value on how close it was 0-100%
// 100m = 100% ... 2000m 5%

// Sumup the percentages of every point
