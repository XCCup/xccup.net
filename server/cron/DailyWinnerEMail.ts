import cron from "node-cron";
import logger from "../config/logger";
import { FLIGHT_STATE } from "../constants/flight-constants";
import flightService from "../service/FlightService";
import { addDays, format, startOfDay } from "date-fns";
import sendMail from "../config/email";
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

    const todaysDate = new Date();

    const startOfToday = startOfDay(todaysDate);
    const endOfToday = startOfDay(addDays(todaysDate, 1));

    const result = (
      await flightService.getAll({
        status: FLIGHT_STATE.IN_RANKING,
        startDate: startOfToday,
        endDate: endOfToday,
        sort: ["flightPoints", "DESC"],
      })
    ).rows;

    logger.info(`DWE: Found ${result.length} flights from today`);

    if (result.length >= DAILY_WINNER_THRESHOLD) {
      const content = {
        title: DAILY_WINNER_TITLE(format(startOfToday, "yyyy-mm-dd")),
        text: DAILY_WINNER_TEXT(
          result.length,
          result[0].externalId,
          format(todaysDate, "HH:mm")
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
