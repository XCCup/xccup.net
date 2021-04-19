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

async function dbConnectionTest() {
  try {
    await sequelize.authenticate();
    console.log(
      `Connection has been established successfully to database ${postDb} on ${host}:${port}.`
    );
  } catch (error) {
    console.error(
      `Unable to connect to the database ${postDb} on ${host}:${port}.:`,
      error
    );
    process.exit(1);
  }
}

dbConnectionTest();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
