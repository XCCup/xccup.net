//Set timezone of node server
if (process.env.SERVER_TIMEZONE) process.env.TZ = process.env.SERVER_TIMEZONE;

if (process.env.NODE_ENV === "CI") {
  require("dotenv").config({ path: "./.env.ci" });
}

const express = require("express");
const app = express();
const logger = require("./config/logger");
const morganLogger = require("./config/logger").morganLogger;
const { handleError } = require("./helper/ErrorHandler");

//Setup DB
require("./config/postgres.js");

//Logging
app.use(morganLogger);

//Development Tools
if (process.env.NODE_ENV !== "production") {
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
if (
  process.env.NODE_ENV !== "production" ||
  process.env.OVERRULE_ACTIVE === "true"
) {
  app.use("/api/testdata", require("./controller/TestDataController"));
  app.use("/api/cache", require("./controller/CacheController"));
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

const PORT = process.env.SERVER_PORT || 3000;
const server = app.listen(
  PORT,
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

function shutdown() {
  logger.info("Shutting down ...");
  server.close(() => {
    logger.info("Exiting ...");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
