if (process.env.NODE_ENV === "CI") {
  // Load a different env file when running in CI; By default .env will always be loaded
  require("dotenv").config({ path: "./.env.ci" });
}
const convict = require("convict");
const { isString } = require("lodash");

const config = convict({
  env: {
    doc: "The application environment",
    format: ["production", "development", "test", "CI"],
    default: "development",
    env: "NODE_ENV",
  },
  port: {
    doc: "The port on which the server will listen",
    format: "nat",
    default: 3000,
    env: "SERVER_PORT",
  },
  logLevel: {
    doc: "The log level which will be used throughout the whole server",
    format: ["error", "warn", "info", "http", "verbose", "debug", "silly"],
    default: "info",
    env: "SERVER_LOG_LEVEL",
  },
  timezone: {
    doc: "The timezone in which the server operates",
    format: noEmptyString,
    default: "Europe/Berlin",
    env: "SERVER_TIMEZONE",
  },
  dataPath: {
    doc: "The path releativ to the application root were data like igc files, images and logs will be stored",
    format: noEmptyString,
    default: "./data",
    env: "SERVER_DATA_PATH",
  },

  clientActivateProfil: {
    doc: "The URL path in the frontend to the activate user profile view",
    format: noEmptyString,
    default: "/profil/aktivieren",
    env: "CLIENT_USER_ACTIVATE_PATH",
  },
  clientPasswordLost: {
    doc: "The URL path in the frontend to the password lost view",
    format: noEmptyString,
    default: "/passwort-vergessen",
    env: "CLIENT_USER_PASSWORD_LOST_PATH",
  },
  clientConfirmEmail: {
    doc: "The URL path in the frontend to the confirm email view",
    format: noEmptyString,
    default: "/email-bestaetigen",
    env: "CLIENT_USER_EMAIL_CHANGE_PATH",
  },
  clientFlight: {
    doc: "The URL path in the frontend to the flight view",
    format: noEmptyString,
    default: "/flug",
    env: "CLIENT_FLIGHT",
  },
  clientUrl: {
    doc: "The URL to the frontend application",
    format: noEmptyString,
    default: "http://localhost:8000",
    env: "CLIENT_URL",
  },
  dicebearUrl: {
    doc: "The URL to the dicebear api",
    format: noEmptyString,
    default: "https://next.xccup.net/dicebear/",
    env: "DICEBEAR_URL",
  },
  elevationUrl: {
    doc: "The URL to the elevation api (if googles elevation api is not used)",
    format: noEmptyString,
    default: "a.elevation-service.net",
    env: "ELEVATION_URL",
  },

  jwtLogin: {
    doc: "The login token for the jwt authentication mechanism",
    format: check128Hex,
    default:
      "bfd2419fb9a02e6b5ee15f4849df10c1b98426c77292f030f04d8a01f4c293a31ba9b6dcf9ad37ef6220a461db11d3e180b85afee58abe94be204b086ca6f01c",
    env: "JWT_LOGIN_TOKEN",
  },
  jwtRefresh: {
    doc: "The login token for the jwt authentication mechanism",
    format: check128Hex,
    default:
      "1430de12edb529a469d5cc91d4f4b2d4495cfe72664df4e7fd1c8ce9f4dc21800e7b8ace49765a98cdad48ff7b4193736e3158c85a9c459a71822ea090a89980",
    env: "JWT_REFRESH_TOKEN",
  },

  mailServiceUrl: {
    doc: "The mail service URL",
    format: noEmptyString,
    default: "a.mailer.net",
    env: "MAIL_SERVICE",
  },
  mailServiceUser: {
    doc: "The mail service user login name",
    format: noEmptyString,
    default: "user@mailer.net",
    env: "MAIL_SERVICE_USER",
  },
  mailServiceFromName: {
    doc: "The name which will be attached to all mails as sender",
    format: noEmptyString,
    default: "XCCup-Beta",
    env: "MAIL_SERVICE_FROM_NAME",
  },
  mailServiceFromEmail: {
    doc: "The E-Mail-Address which will be attached to all mails as response address",
    format: noEmptyString,
    default: "user@mailer.net",
    env: "MAIL_SERVICE_FROM_EMAIL",
  },
  mailServicePassword: {
    doc: "The mail service user login password",
    format: noEmptyString,
    default: "N!c€P@$$w0rD",
    env: "MAIL_SERVICE_PASSWORD",
  },

  disableApiProtection: {
    doc: "This option disables die API protection (limitation of requests to certain endpoints)",
    format: Boolean,
    default: false,
    env: "DISABLE_API_PROTECTION",
  },
  overruleActive: {
    doc: "This option overrules some restrictions of the application (e.g. time upload limit of a flight)",
    format: Boolean,
    default: false,
    env: "OVERRULE_ACTIVE",
  },
  daysFlightEditable: {
    doc: "This option defines the timeframe after takeoff in which a flight can be uploaded or edited",
    format: "nat",
    default: 14,
    env: "DAYS_FLIGHT_EDITABLE",
  },

  serverImportTestData: {
    doc: "A switch which signals that on server startup a testdata set should be loaded",
    format: Boolean,
    default: false,
    env: "SERVER_IMPORT_TEST_DATA",
  },
  serverImportOriginalData: {
    doc: "A switch which signals that on server startup original data sets should be loaded",
    format: Boolean,
    default: false,
    env: "SERVER_IMPORT_ORIGINAL_DATA",
  },
  serverImportToken: {
    doc: "A token to confirm any action with the ImportDataController",
    format: noEmptyString,
    default: "2025a7ec-d1e1-40b1-aadd-7d14b1ccf4c5",
    env: "SERVER_IMPORT_TOKEN",
  },

  dbSyncForce: {
    doc: "If set to true this option will force a syncronisation between the sequlize models defined in the codebase and the database. This will erase all erase all memomry in the associated database tables.",
    format: Boolean,
    default: false,
    env: "DB_SYNC_FORCE",
  },
  dbConnectFailProcess: {
    doc: "A switch which signals that the server should be terminated if no connection to the database could be established",
    format: Boolean,
    default: false,
    env: "DB_CONNECT_FAIL_PROCESS",
  },
  dbConnectMaxAttempts: {
    doc: "The number of how many connection attempts to the database are possible before the process will fail",
    format: "nat",
    default: 5,
    env: "DB_CONNECT_MAX_ATTEMPTS",
  },
  dbConnectTimeout: {
    doc: "The number of milliseconds which will be waited before another connection attempt to the database will be started",
    format: "nat",
    default: 10000,
    env: "DB_CONNECT_TIMEOUT",
  },

  useGoogleApi: {
    doc: "Enables the usage of the google api to retrieve for example location names",
    format: Boolean,
    default: false,
    env: "USE_GOOGLE_API",
  },
  useGoogleElevationApi: {
    doc: "Enables the usage of the google api to retrieve elevation data",
    format: Boolean,
    default: false,
    env: "USE_GOOGLE_ELEVATION_API",
  },
  googleMapsApiKey: {
    doc: "The key for the google maps api",
    format: String,
    default: "qwertz12345",
    env: "GOOGLE_MAPS_API_KEY",
  },

  postgresUser: {
    doc: "The key for the google maps api",
    format: String,
    default: "xccup_user",
    env: "POSTGRES_USER",
  },
  postgresPw: {
    doc: "The key for the google maps api",
    format: String,
    default: "xccup_pw",
    env: "POSTGRES_PASSWORD",
  },
  postgresDb: {
    doc: "The key for the google maps api",
    format: String,
    default: "xccup_db",
    env: "POSTGRES_DB",
  },
  postgresPort: {
    doc: "The key for the google maps api",
    format: "nat",
    default: 5432,
    env: "POSTGRES_PORT",
  },
  postgresHost: {
    doc: "The key for the google maps api",
    format: String,
    default: "db",
    env: "POSTGRES_HOST",
  },
});

config.validate({ allowed: "strict" });

module.exports = config;

function check128Hex(val) {
  if (!/^[a-fA-F0-9]{128}$/.test(val)) {
    throw new Error("must be a 128 character hex key");
  }
}

function noEmptyString(val) {
  if (!isString(val) || !val.trim().length) {
    throw new Error("must be a non empty string");
  }
}