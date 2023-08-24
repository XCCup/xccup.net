import cron from "node-cron";
import logger from "../config/logger";
import { Op } from "sequelize";
import { subMonths } from "date-fns";
import db from "../db";

// Run the job every day at 02:00
const task = cron.schedule("0 2 * * *", cleanTokenStore);

logger.info("CIS: Will start cron job clean token store");
task.start();

async function cleanTokenStore() {
  try {
    logger.info("CIS: Will clean token store");

    // Remove all tokens which weren't used in the last 3 months
    const nowMinus3Months = subMonths(new Date(), 3);

    const numberOfRemovedTokens = await db.Token.destroy({
      where: {
        lastRefresh: {
          [Op.lte]: nowMinus3Months,
        },
      },
    });
    logger.info(`CIS: Removed ${numberOfRemovedTokens} tokens from store`);
  } catch (error) {
    logger.error("Cron job clean token store failed with error: " + error);
  }
}
