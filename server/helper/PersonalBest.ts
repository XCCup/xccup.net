import { FlightInstance } from "../db/models/Flight";
import { Op } from "sequelize";
import db from "../db";

export async function checkIfFlightIsNewPersonalBest(flight: FlightInstance) {
  const newBestFlight: FlightInstance | null = await db.Flight.findOne({
    where: {
      // @ts-ignore
      userId: flight.userId,
      flightDistance: { [Op.gt]: flight.flightDistance },
      flightType: flight.flightType,
    },
  });

  if (newBestFlight) return false;
  return true;
}
