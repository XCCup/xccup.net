import logger from "../config/logger";
import {
  FlightAttributes,
  FlightInstance,
  FlightInstanceUserInclude,
} from "../db/models/Flight";
import { FlightFixesInstance } from "../db/models/FlightFixes";
import { combineFixesProperties } from "../helper/FlightFixUtils";
import db from "../db";
import { inRange, mean } from "lodash";
import { FlightFixCombined } from "../types/FlightFixes";
import { calcSingleAirbuddyPercentage } from "../helper/AirbuddyPercentageCalculation";
import { Op } from "sequelize";
import { UserInstance } from "../db/models/User";

const RESOLUTION = 100;

export async function findAirbuddies(
  flight: FlightInstance,
  fixes: FlightFixesInstance
) {
  const startTime = new Date();
  logger.info("AF: Start airbuddy search");

  const minimizedFixes: FlightFixCombined[] = minimizeFixesOfFlight(fixes);

  logger.debug(
    "AF: Number of entries in the minimized fixes array: " +
      minimizedFixes.length
  );

  const { otherFlights, otherTracks } =
    await findFlightsAndTracksWhichWereUpAtSameTime(flight);

  const user = await db.User.findByPk(flight.userId);
  if (!user) {
    logger.error("AF: No user was found for flight " + flight.id);
    return;
  }

  const results = [];
  for (let i = 0; i < otherFlights.length; i++) {
    const otherFlight = otherFlights[i];
    const otherTrack = otherTracks[i];

    const matchedLocationPoints: {
      original: FlightFixCombined;
      other: FlightFixCombined;
    }[] = matchLocationPoints(minimizedFixes, otherTrack);

    const percentages = await calcPercentageValuesForLocations(
      matchedLocationPoints
    );

    addMissingValues(minimizedFixes, matchedLocationPoints, percentages);

    logger.debug("AF: Result of correlation percentages: " + percentages);

    // Calculate mean percentage value
    const meanValue = mean(percentages);

    logger.info(
      `AF: The flight ${flight.externalId} matches by ${meanValue}% with the flight ${otherFlight.externalId}`
    );

    if (meanValue == 0) return;
    saveAirbuddyValueOnOtherFlight(otherFlight, flight, meanValue, user);
    results.push({ otherFlight, correlationPercentage: meanValue });
  }

  saveAirbuddyValueOnFlight(flight, results);

  const endTime = new Date();
  logger.info(
    "AF: It took " +
      (endTime.getTime() -
        startTime.getTime() +
        "ms to calc the airbuddy correlation percentage")
  );
}

function minimizeFixesOfFlight(fixes: FlightFixesInstance) {
  const combinedFixes = combineFixesProperties(fixes);
  const fixesStep = Math.floor(combinedFixes.length / RESOLUTION);
  logger.debug("AF: Will split fixes in steps of " + fixesStep);
  const minimizedFixes: FlightFixCombined[] = [];
  for (let index = 0; index < combinedFixes.length; index += fixesStep) {
    minimizedFixes.push(combinedFixes[index]);
  }
  return minimizedFixes;
}

function saveAirbuddyValueOnOtherFlight(
  otherFlight: FlightInstance,
  flight: FlightInstance,
  correlationPercentage: number,
  user: UserInstance
) {
  if (!flight.externalId) return;

  const airbuddy = {
    externalId: flight.externalId,
    correlationPercentage,
    userFirstName: user.firstName as string,
    userLastName: user.lastName as string,
    userId: user.id,
  };

  if (!otherFlight.airbuddies?.length) {
    logger.debug("AF: Create new airbuddy array on otherFlight");
    otherFlight.airbuddies = [airbuddy];
  } else {
    // This should prevent reuploads to occure multiple times within airbuddies
    const userIsAlreadyAirbuddy = otherFlight.airbuddies.find(
      (a) => a.userId == user.id
    );

    if (userIsAlreadyAirbuddy) {
      logger.debug("AF: Update airbuddy entry on otherFlight");
      userIsAlreadyAirbuddy.correlationPercentage = correlationPercentage;
      userIsAlreadyAirbuddy.externalId = flight.externalId;
    } else {
      logger.debug("AF: Append airbuddy entry on otherFlight");
      otherFlight.airbuddies.push(airbuddy);
    }

    otherFlight.changed("airbuddies", true);
  }

  otherFlight.save();
}

function saveAirbuddyValueOnFlight(
  flight: FlightInstance,
  results: {
    otherFlight: FlightInstanceUserInclude;
    correlationPercentage: number;
  }[]
) {
  results.forEach((r) => {
    if (!r.otherFlight.externalId) return;
    const airbuddy = {
      externalId: r.otherFlight.externalId,
      correlationPercentage: r.correlationPercentage,
      userFirstName: r.otherFlight.user.firstName as string,
      userLastName: r.otherFlight.user.lastName as string,
      userId: r.otherFlight.user.id as string,
    };

    if (!flight.airbuddies?.length) {
      logger.debug("AF: Create new airbuddy array on flight");
      flight.airbuddies = [airbuddy];
    } else {
      // This should prevent reuploads to occure multiple times within airbuddies
      const userIsAlreadyAirbuddy = flight.airbuddies.find(
        (a) => a.userId == r.otherFlight.user.id
      );

      if (userIsAlreadyAirbuddy) {
        logger.debug("AF: Update airbuddy entry on flight");
        userIsAlreadyAirbuddy.correlationPercentage = r.correlationPercentage;
        userIsAlreadyAirbuddy.externalId = r.otherFlight.externalId;
      } else {
        logger.debug("AF: Append airbuddy entry on flight");
        flight.airbuddies.push(airbuddy);
      }

      flight.changed("airbuddies", true);
    }
  });

  flight.save();
}

async function findFlightsAndTracksWhichWereUpAtSameTime(
  flight: FlightAttributes
) {
  const otherFlights = (await db.Flight.findAll({
    where: {
      [Op.or]: [
        {
          // Flight starts and ends inside timeframe
          takeoffTime: { [Op.gte]: flight.takeoffTime },
          landingTime: { [Op.lte]: flight.landingTime },
        },
        {
          // Flight starts inside and ends after timeframe
          takeoffTime: { [Op.lte]: flight.landingTime },
          landingTime: { [Op.gte]: flight.takeoffTime },
        },
        {
          // Flight starts before and ends inside timeframe
          takeoffTime: { [Op.lte]: flight.takeoffTime },
          landingTime: { [Op.gte]: flight.takeoffTime },
        },
      ],
      [Op.not]: {
        // Exclude oneself from results
        id: flight.id,
      },
    },
    attributes: ["id", "externalId", "airbuddies"],
    include: {
      model: db.User,
      as: "user",
      attributes: ["id", "firstName", "lastName", "fullName"],
    },
  })) as FlightInstanceUserInclude[];

  const flightIds = otherFlights.map((f) => f.id);
  const flightExIds = otherFlights.map((f) => f.externalId);

  logger.debug(
    "AF: Found these flights which were up at the same time: " + flightExIds
  );

  if (flightIds.length == 0) return { otherFlights, otherTracks: [] };

  const otherTracks = (await db.FlightFixes.findAll({
    where: {
      // @ts-ignore
      flightId: {
        [Op.in]: flightIds,
      },
    },
  })) as FlightFixesInstance[];

  return { otherFlights, otherTracks };
}

function matchLocationPoints(
  minimizedFixes: FlightFixCombined[],
  otherTrack: FlightFixesInstance | null
) {
  const matchedLocationPoints: {
    original: FlightFixCombined;
    other: FlightFixCombined;
  }[] = [];

  minimizedFixes.forEach((f) => {
    if (!otherTrack) return;
    const combinedOtherFixes = combineFixesProperties(otherTrack);
    const found = combinedOtherFixes.find(
      (oF) =>
        // Search in a range around the timestamp incase the tracker uses a different logging interval
        oF.timestamp == f.timestamp ||
        inRange(oF.timestamp, f.timestamp - 5 * 1000, f.timestamp + 5 * 1000)
    );
    if (found) matchedLocationPoints.push({ original: f, other: found });
  });

  logger.debug(
    "AF: Number of entries in the related minimized fixes array: " +
      matchedLocationPoints.length
  );

  return matchedLocationPoints;
}

async function calcPercentageValuesForLocations(
  otherTrackTimeRelatedFixes: {
    original: FlightFixCombined;
    other: FlightFixCombined;
  }[]
) {
  return await Promise.all(
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
}

function addMissingValues(
  minimizedFixes: FlightFixCombined[],
  otherTrackTimeRelatedFixes: {
    original: FlightFixCombined;
    other: FlightFixCombined;
  }[],
  percentages: number[]
) {
  // Add for missing fixes 0 percentage
  for (
    let index = 0;
    index < minimizedFixes.length - otherTrackTimeRelatedFixes.length;
    index++
  ) {
    percentages.push(0);
  }
}

function createDistanceQueryString(a: FlightFixCombined, b: FlightFixCombined) {
  return `
  SELECT ST_DistanceSphere(
    (SELECT ST_SetSRID(ST_MakePoint(${a.longitude},${a.latitude}),4326)::geometry),
    (SELECT ST_SetSRID(ST_MakePoint(${b.longitude},${b.latitude}),4326)::geometry))
    `;
}
