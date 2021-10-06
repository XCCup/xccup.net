const { Sequelize } = require("sequelize");
const { loadModels } = require("../model/ModelLoader");

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
  `postgres://${user}:${pw}@${host}:${port}/${postDb}`
);

loadModels(db, sequelize);

dbConnectionTest().then(async () => {
  if (process.env.DB_SYNC_ALTER == "true") {
    console.log("Will alter DB Tables");
    await sequelize.sync({ alter: true }).catch((error) => {
      console.error(error);
    });
  }
  if (
    process.env.DB_SYNC_FORCE == "true" &&
    process.env.NODE_ENV === "development"
  ) {
    console.log("Will create DB Tables");
    await sequelize
      .sync({ force: true })
      .then(() => addTestData())
      .catch((error) => {
        console.error(error);
      });
  }
});

process.env.DB_SYNC_IN_PROGRESS = false;

async function dbConnectionTest(numberOfRetry = 0) {
  try {
    await sequelize.authenticate();
    console.log(
      `Connection has been established successfully to database ${postDb} on ${host}:${port}.`
    );
  } catch (error) {
    console.error(
      `Unable to connect to the database ${postDb} on ${host}:${port}. Attempt number: ${numberOfRetry}:`,
      error
    );
    if (numberOfRetry == maxNumberOfRetries) {
      if (failProcess == "true") {
        console.error(
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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addTestData() {
  if (process.env.DB_ADD_TESTDATA == "true") {
    console.log("Will check for testdata");
    require("../test/DbTestData").checkForTestDataAndAddIfMissing();
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
