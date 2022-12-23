import { FlightInstance } from "../db/models/Flight";
import { Op } from "sequelize";
import db from "../db";
import { MINIMUM_PB_FLIGHT_DISTANCE } from "../constants/flight-constants";

export async function checkIfFlightIsNewPersonalBest(flight: FlightInstance) {
  //  Do not flag short flights as a new personal best.
  // TODO: Model says flightDistance is a number but it's acutally a string... may already be solved in another PR
  if (
    !flight.flightDistance ||
    +flight.flightDistance < MINIMUM_PB_FLIGHT_DISTANCE
  )
    return false;
  const newBestFlight: FlightInstance | null = await db.Flight.findOne({
    where: {
      // @ts-ignore 😡 sequelize
      userId: flight.userId,
      externalId: { [Op.ne]: flight.externalId },
      flightDistance: { [Op.gte]: flight.flightDistance },
      flightType: flight.flightType,
    },
  });

  if (newBestFlight) return false;
  return true;
}
