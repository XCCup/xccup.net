import { Sequelize } from "sequelize";
import { loadModels } from "../model/ModelLoader";
import logger from "./logger";
import { sleep } from "../helper/Utils";
import config from "./env-config";

const port = config.get("postgresPort");
const user = config.get("postgresUser");
const pw = config.get("postgresPw");
const postDb = config.get("postgresDb");
const host = config.get("postgresHost");
const maxNumberOfRetries = config.get("dbConnectMaxAttempts");
const reconnectTimeout = config.get("dbConnectTimeout");
const failProcess = config.get("dbConnectFailProcess");

const db = {};

const sequelize = new Sequelize(
  `postgres://${user}:${pw}@${host}:${port}/${postDb}`,
  {
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

loadModels(db, sequelize);

dbConnectionTest().then(async () => {
  if (
    config.get("dbSyncForce") == true
    // && config.get("env") === "development"
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

db.sequelize = sequelize;

module.exports = db;
