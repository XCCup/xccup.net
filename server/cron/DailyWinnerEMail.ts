import cron from "node-cron";
import logger from "../config/logger";
import { STATE } from "../constants/flight-constants";
import flightService from "../service/FlightService";
import moment from "moment";
import sendMail from "../config/email";
import config from "../config/env-config";
import {
  DAILY_WINNER_TEXT,
  DAILY_WINNER_TITLE,
} from "../constants/email-message-constants";

const DAILY_WINNER_THRESHOLD = 3;

// Run the job every day at 22:15
const task = cron.schedule("15 22 * * *", informAboutDailyWinner);

logger.info("DWE: Will start cron job daily winner email");
task.start();

async function informAboutDailyWinner() {
  try {
    logger.info("DWE: Will look if there is a daily winner");

    const startOfToday = moment().startOf("day");
    const endOfToday = moment().add(1, "d").startOf("day");

    const result = (
      await flightService.getAll({
        status: STATE.IN_RANKING,
        startDate: startOfToday.toDate(),
        endDate: endOfToday.toDate(),
        sort: ["flightPoints", "DESC"],
      })
    ).rows;

    logger.info(`DWE: Found ${result.length} flights from today`);

    if (result.length >= DAILY_WINNER_THRESHOLD) {
      const content = {
        title: DAILY_WINNER_TITLE(startOfToday.format("YYYY-MM-DD")),
        text: DAILY_WINNER_TEXT(
          result.length,
          result[0].externalId,
          moment().format("HH:mm")
        ),
      };

      sendMail(["baerbel@xccup.net", "info@xccup.net"], content);
    }
  } catch (error) {
    logger.error(
      "DWE: Cron job daily winner email failed with error: " + error
    );
  }
}
