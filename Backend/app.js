// DIRTY Is it really dirty?
require("dotenv").config({ path: "./.env.local" });

const express = require("express");
const app = express();

//Setup DB
require("./config/postgres.js");

//Init authentication tokens
require("./controller/Auth").initAuth();

//Development Tools
if (process.env.NODE_ENV === "development") {
  // https://expressjs.com/en/resources/middleware/cors.html
  // https://medium.com/swlh/simple-steps-to-fix-cors-error-a2029f9b257a
  var cors = require("cors");
  app.use(cors());
  //Logging
  const morgan = require("morgan");
  app.use(morgan("dev"));
  //SwaggerUI
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./swagger.json");
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use(express.urlencoded({ extended: false }));
//The default size limit for a request body is 100kb
//IGC-Files can easily exceed this limit
app.use(express.json({ limit: "5mb" }));

//Reset all caches when a non GET requests occurs
app.all("*", (req, res, next) => {
  if (req.method != "GET") {
    const cacheManager = require("./service/CacheManager");
    cacheManager.invalidateCaches();
  }
  next();
});

app.get("/", (request, response) =>
  response.json({ info: "Welcome to the XCCup API" })
);
app.use("/users", require("./controller/UserController.js"));
app.use("/flights", require("./controller/FlightController.js"));
app.use("/comments", require("./controller/CommentController.js"));
app.use("/seasons", require("./controller/SeasonController"));
app.use("/clubs", require("./controller/ClubController"));
app.use("/teams", require("./controller/TeamController"));
app.use("/airspaces", require("./controller/AirspaceController"));
app.use("/results", require("./controller/ResultController"));
app.use("/home", require("./controller/HomeController"));
app.use("/news", require("./controller/NewsController"));
app.use("/sponsors", require("./controller/SponsorController"));
app.use("/media", require("./controller/MediaController"));

// Handle global errors on requests. Endpoints have to forward the error to their own next() function!
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  const {
    handleSequelizeUniqueError,
    handleXccupRestrictionError,
    handleGeneralError,
  } = require("./helper/ErrorHandler");

  if (handleSequelizeUniqueError(err, res)) return;
  if (handleXccupRestrictionError(err, res)) return;

  handleGeneralError(err, res);
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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
