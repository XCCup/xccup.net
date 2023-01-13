import path from "path";
import fs from "fs";
import cron from "node-cron";
import logger from "../config/logger";
import { deleteIgcFile } from "../helper/igc-file-utils";
import { Op } from "sequelize";
import { FLIGHT_STATE } from "../constants/flight-constants";
import { FlightAttributes, FlightInstance } from "../db/models/Flight";
import db from "../db";
import config from "../config/env-config";

// Run the job every day at 02:00
const task = cron.schedule("0 2 * * *", cleanIgcStore);

logger.info("CIS: Will start cron job clean igc store");
task.start();

async function cleanIgcStore() {
  try {
    logger.info("CIS: Will clean igc store");
    const nowMinus1Hour = new Date();
    // Remove all flights which are longer than 1h in an unfinished state
    nowMinus1Hour.setHours(nowMinus1Hour.getHours() - 1);

    const flightsToDelete: FlightAttributes[] = (
      await db.Flight.findAll({
        where: {
          flightStatus: FLIGHT_STATE.IN_PROCESS,
          // @ts-ignore
          createdAt: {
            [Op.lte]: nowMinus1Hour,
          },
        },
      })
    ).map((v: FlightInstance) => v.toJSON());
    flightsToDelete.forEach((flight) => {
      deleteIgcFile(flight.igcPath);
      db.Flight.destroy({
        where: {
          id: flight.id,
        },
      });
    });
    logger.info(
      `CIS: Removed ${flightsToDelete.length} unfinished flights from store`
    );

    logger.info("CIS: Will clean igc temp folder");
    const igcTempPath = path.join(
      config.get("rootDir"),
      config.get("dataPath"),
      "igc",
      "temp"
    );
    fs.rmSync(igcTempPath, { recursive: true, force: true });
  } catch (error) {
    logger.error("Cron job clean igc store failed with error: " + error);
  }
}
