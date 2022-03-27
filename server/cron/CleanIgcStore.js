const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const logger = require("../config/logger").default;
const { deleteIgcFile } = require("../helper/igc-file-utils");
const { Op } = require("sequelize");
const Flight = require("../config/postgres")["Flight"];
const { STATE } = require("../constants/flight-constants");

// Run the job every day at 02:00
const task = cron.schedule("0 2 * * *", cleanIgcStore);

logger.info("CIS: Will start cron job: clean igc store");
task.start();

async function cleanIgcStore() {
  try {
    logger.info("CIS: Will clean igc store");
    const nowMinus1Hour = new Date();
    // Remove all flights which are longer than 1h in an unfinished state
    nowMinus1Hour.setHours(nowMinus1Hour.getHours() - 1);
    const flightsToDelete = (
      await Flight.findAll({
        where: {
          flightStatus: STATE.IN_PROCESS,
          createdAt: {
            [Op.lte]: nowMinus1Hour,
          },
        },
      })
    ).map((v) => v.toJSON());
    flightsToDelete.forEach((flight) => {
      deleteIgcFile(flight.igcPath);
      Flight.destroy({
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
      global.__basedir,
      process.env.SERVER_DATA_PATH,
      "igc",
      "temp"
    );
    fs.rmSync(igcTempPath, { recursive: true, force: true });
  } catch (error) {
    logger.error("Cron job clean igc store failed with error: " + error);
  }
}
