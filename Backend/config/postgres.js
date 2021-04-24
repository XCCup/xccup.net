const { Sequelize } = require("sequelize");

const db = {};

const port = process.env.POSTGRES_PORT;
const user = process.env.POSTGRES_USER;
const pw = process.env.POSTGRES_PW;
const postDb = process.env.POSTGRES_DB;
const host = process.env.POSTGRES_HOST;

const sequelize = new Sequelize(
  `postgres://${user}:${pw}@${host}:${port}/${postDb}`
);

async function dbConnectionTest(numberOfRetry = 0) {
  const maxNumberOfRetries = process.env.DB_CONNECT_MAX_ATTEMPTS;
  const reconnectTimeout = process.env.DB_CONNECT_TIMEOUT;
  const failProcess = process.env.DB_CONNECT_FAIL_PROCESS;
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

//Initial start of connection test
dbConnectionTest();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
