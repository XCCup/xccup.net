if (process.env.NODE_ENV === "CI") {
  require("dotenv").config({ path: "./.env.ci" });
}

const express = require("express");
const app = express();
const logger = require("./config/logger");
const morganLogger = require("./config/logger").morganLogger;

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
if (process.env.NODE_ENV !== "production") {
  app.use("/api/testdata", require("./controller/TestDataController"));
}

//Reset all caches when a non GET requests occurs
app.all("*", (req, res, next) => {
  if (req.method != "GET") {
    const cacheManager = require("./service/CacheManager");
    cacheManager.invalidateCaches();
  }
  next();
});

// Handle global errors on requests. Endpoints have to forward the error to their own next() function!
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  const {
    handleSequelizeUniqueError,
    handleXccupRestrictionError,
    handleGeneralError,
  } = require("./helper/ErrorHandler");

  if (handleSequelizeUniqueError(err, req, res)) return;
  if (handleXccupRestrictionError(err, req, res)) return;

  handleGeneralError(err, req, res);
});

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
app.listen(
  PORT,
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
