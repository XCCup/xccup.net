// Set global base dir
// TODO: A config with export may be more elegant => config/path.ts
// @ts-ignore
global.__basedir = __dirname;

// Load server config
import config from "./config/env-config";
import express from "express";
import logger from "./config/logger";
// @ts-ignore
import { handleError } from "./helper/ErrorHandler";
import compression from "compression";
import { morganLogger } from "./config/logger";

//Set timezone of node server
process.env.TZ = config.get("timezone");

const app = express();

//Setup DB
import "./config/postgres.js";

//Start Cron Jobs
import "./cron/CleanIgcStore";
import "./cron/DailyWinnerEMail";

//Logging
app.use(morganLogger);

//Compression
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
      }

      /**
       * This compression reduces the size of a JSON by roughly 4.5 times.
       * It has no effect on images.
       */

      return compression.filter(req, res);
    },
  })
);

//Development Tools
if (config.get("env") !== "production") {
  // https://expressjs.com/en/resources/middleware/cors.html
  // https://medium.com/swlh/simple-steps-to-fix-cors-error-a2029f9b257a
  var cors = require("cors");
  app.use(cors());
}

app.use(express.urlencoded({ extended: false }));
//The default size limit for a request body is 100kb
//IGC-Files can easily exceed this limit
app.use(express.json({ limit: "5mb" }));

app.get("/api", (request, response) =>
  response.json({ info: "Welcome to the XCCup API" })
);
app.use("/api/users", require("./controller/UserController.js"));
app.use("/api/flights", require("./controller/FlightController.js"));
app.use("/api/comments", require("./controller/CommentController.js"));
app.use("/api/seasons", require("./controller/SeasonController"));
app.use("/api/clubs", require("./controller/ClubController"));
app.use("/api/teams", require("./controller/TeamController"));
app.use("/api/airspaces", require("./controller/AirspaceController"));
app.use("/api/results", require("./controller/ResultController"));
app.use("/api/home", require("./controller/HomeController"));
app.use("/api/news", require("./controller/NewsController"));
app.use("/api/sponsors", require("./controller/SponsorController"));
app.use("/api/media", require("./controller/MediaController"));
app.use("/api/general", require("./controller/GeneralController"));
app.use("/api/mail", require("./controller/MailController"));
app.use("/api/sites", require("./controller/SiteController"));
app.use("/api/cache", require("./controller/CacheController"));
if (config.get("env") !== "production" || config.get("overruleActive")) {
  app.use("/api/testdata", require("./controller/TestDataController"));
  app.use("/api/importdata", require("./controller/ImportDataController"));
}

// Handle global errors on requests. Endpoints have to forward the error to their own next() function!
app.use(handleError);

// Handle calls to non exisiting routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Endpoint not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

const port = config.get("port");
const server = app.listen(port, () =>
  logger.info(`A: Server running in ${config.get("env")} mode on port ${port}`)
);

function shutdown() {
  logger.info("A: Shutting down ...");
  server.close(() => {
    logger.info("A: Exiting ...");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
