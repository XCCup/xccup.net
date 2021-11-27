const { Sequelize } = require("sequelize");
const { loadModels } = require("../model/ModelLoader");
const logger = require("./logger");
const { sleep } = require("../helper/Utils");

const port = process.env.POSTGRES_PORT;
const user = process.env.POSTGRES_USER;
const pw = process.env.POSTGRES_PASSWORD;
const postDb = process.env.POSTGRES_DB;
const host = process.env.POSTGRES_HOST;
const maxNumberOfRetries = process.env.DB_CONNECT_MAX_ATTEMPTS;
const reconnectTimeout = process.env.DB_CONNECT_TIMEOUT;
const failProcess = process.env.DB_CONNECT_FAIL_PROCESS;

const db = {};

process.env.DB_SYNC_IN_PROGRESS = true;

const sequelize = new Sequelize(
  `postgres://${user}:${pw}@${host}:${port}/${postDb}`,
  {
    logging: (msg) => logger.debug(msg),
  }
);

loadModels(db, sequelize);

dbConnectionTest().then(async () => {
  if (
    process.env.DB_SYNC_FORCE == "true"
    // && process.env.NODE_ENV === "development"
  ) {
    logger.info("Will create DB Tables");
    await sequelize
      .sync({ force: true })
      .then(() => addTestData())
      .catch((error) => {
        logger.error(error);
      });
  }
});

process.env.DB_SYNC_IN_PROGRESS = false;

async function dbConnectionTest(numberOfRetry = 0) {
  try {
    await sequelize.authenticate();
    logger.info(
      `Connection has been established successfully to database ${postDb} on ${host}:${port}.`
    );
  } catch (error) {
    logger.warn(
      `Unable to connect to the database ${postDb} on ${host}:${port}. Attempt number: ${numberOfRetry}:`,
      error
    );
    if (numberOfRetry == maxNumberOfRetries) {
      if (failProcess == "true") {
        logger.error(
          `Unable to connect to the database after ${maxNumberOfRetries} attempts. Will terminate process.`
        );
        process.exit(1);
      }
      return;
    }
    await sleep(reconnectTimeout);
    dbConnectionTest(numberOfRetry + 1);
  }
}

function addTestData() {
  if (process.env.DB_ADD_TESTDATA == "true") {
    logger.info("Will check for testdata");
    require("../test/DbTestDataLoader").addTestData();
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
