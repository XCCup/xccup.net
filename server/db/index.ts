import { Sequelize } from "sequelize";
import logger from "../config/logger";
import config from "../config/env-config";
import { sleep } from "../helper/Utils";

// Import Model init
import { initAirspace } from "./models/Airspace";
import { initBrand } from "./models/Brand";
import { initClub } from "./models/Club";
import { initFlight } from "./models/Flight";
import { initFlightComment } from "./models/FlightComment";
import { initFlightFixes } from "./models/FlightFixes";
import { initFlightPhoto } from "./models/FlightPhoto";
import { initFlyingSite } from "./models/FlyingSite";
import { initLogo } from "./models/Logo";
import { initNews } from "./models/News";
import { initProfilePicture } from "./models/ProfilePicture";
import { initResult } from "./models/Result";
import { initSeasonDetail } from "./models/SeasonDetail";
import { initSponsor } from "./models/Sponsor";
import { initTeam } from "./models/Team";
import { initToken } from "./models/Token";
import { initUser } from "./models/User";
import { initMessage } from "./models/Message";
import { Models } from "../types/Models";

// Config
const port = config.get("postgresPort");
const user = config.get("postgresUser");
const pw = config.get("postgresPw");
const postDb = config.get("postgresDb");
const host = config.get("postgresHost");
const maxNumberOfRetries = config.get("dbConnectMaxAttempts");
const reconnectTimeout = config.get("dbConnectTimeout");
const failProcess = config.get("dbConnectFailProcess");

const url = `postgres://${user}:${pw}@${host}:${port}/${postDb}`;

const sequelize = new Sequelize(url, {
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

const models: Models = {
  Airspace: initAirspace(sequelize),
  Brand: initBrand(sequelize),
  Club: initClub(sequelize),
  Flight: initFlight(sequelize),
  FlightComment: initFlightComment(sequelize),
  FlightFixes: initFlightFixes(sequelize),
  FlightPhoto: initFlightPhoto(sequelize),
  FlyingSite: initFlyingSite(sequelize),
  Logo: initLogo(sequelize),
  News: initNews(sequelize),
  ProfilePicture: initProfilePicture(sequelize),
  Result: initResult(sequelize),
  SeasonDetail: initSeasonDetail(sequelize),
  Sponsor: initSponsor(sequelize),
  Team: initTeam(sequelize),
  Token: initToken(sequelize),
  User: initUser(sequelize),
  Message: initMessage(sequelize),
};

const db = {
  sequelize,
  ...models,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

dbConnectionTest().then(async () => {
  if (
    config.get("dbSyncForce") == true &&
    config.get("env") === "development"
  ) {
    logger.info("P: Will create DB Tables");
    await sequelize.sync({ force: true }).catch((error) => {
      logger.error(error);
    });
  }
});

async function dbConnectionTest(numberOfRetry = 0) {
  try {
    await sequelize.authenticate();
    logger.info(
      `P: Connection has been established successfully to database ${postDb} on ${host}:${port}.`
    );
  } catch (error) {
    logger.warn(
      `P: Unable to connect to the database ${postDb} on ${host}:${port}. Attempt number: ${numberOfRetry}:`,
      error
    );
    if (numberOfRetry == maxNumberOfRetries) {
      if (failProcess == true) {
        logger.error(
          `P: Unable to connect to the database after ${maxNumberOfRetries} attempts. Will terminate process.`
        );
        process.exit(1);
      }
      return;
    }
    await sleep(reconnectTimeout);
    dbConnectionTest(numberOfRetry + 1);
  }
}

export default db;
module.exports = db;
