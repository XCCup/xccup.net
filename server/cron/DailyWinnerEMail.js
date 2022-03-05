const cron = require("node-cron");
const logger = require("../config/logger");
const { STATE } = require("../constants/flight-constants");
const flightService = require("../service/FlightService");
const moment = require("moment");
const sendMail = require("../config/email");

const DAILY_WINNER_THRESHOLD = 5;

// Run the job every day at 22:15
const task = cron.schedule("15 22 * * *", informAboutDailyWinner);

logger.info("DWE: Will start cron job: daily winner email");
task.start();

async function informAboutDailyWinner() {
  try {
    logger.info("DWE: Will look if there is a daily winner");

    const today = moment().format("YYYY-MM-DD");
    const tomorrow = moment().add(1, "d").format("YYYY-MM-DD");

    const result = (
      await flightService.getAll({
        status: STATE.IN_RANKING,
        startDate: today,
        endDate: tomorrow,
        sort: ["flightPoints", "DESC"],
      })
    ).rows;

    logger.info(`DWE: Found ${result.length} flights from today`);

    if (result.length >= DAILY_WINNER_THRESHOLD) {
      const content = {
        title: `XCCup Tagessieger ${today}`,
        text: `Hallo Wolf,
Heute gab es insgesamt ${result.length} Wertungsflüge. 
        
Bis jetzt ${moment().format("HH:mm")} liegt der Flug https://xccup.net/flug/${
          result[0].externalId
        } vorne. Den aktuell Stand findest du auf der Startseite https://xccup.net.
        
Viele Grüße Deine Admins`,
      };

      sendMail(["wolf@xccup.net", "info@xccup.net"], content);
    }
  } catch (error) {
    logger.error(
      "DWE: Cron job daily winner email failed with error: " + error
    );
  }
}
