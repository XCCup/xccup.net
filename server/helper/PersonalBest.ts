import { FlightInstance } from "../db/models/Flight";
import { Op } from "sequelize";
import db from "../db";

export async function checkIfFlightIsNewPersonalBest(flight: FlightInstance) {
  //  Do not flag short flights as a new personal best.
  if (flight.flightPoints && flight.flightPoints < 40) return false;

  const newBestFlight: FlightInstance | null = await db.Flight.findOne({
    where: {
      // @ts-ignore 😡 sequelize
      userId: flight.userId,
      flightDistance: { [Op.gt]: flight.flightDistance },
      flightType: flight.flightType,
    },
  });

  if (newBestFlight) return false;
  return true;
}
