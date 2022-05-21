// Load server config
import config from "./config/env-config";

// Setup DB
import "./db";

import express, { Application, Request, Response } from "express";
import routes from "./routes";

import logger from "./config/logger";
import expressLogger from "./config/express-logger";
import { handleError } from "./helper/ErrorHandler";

import compression from "compression";
import cors from "cors";

// Set timezone of node server
process.env.TZ = config.get("timezone");

const app: Application = express();

// Start Cron Jobs
import "./cron/CleanIgcStore";
import "./cron/DailyWinnerEMail";

// Logging
app.use(expressLogger);

// Compression
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

// Development Tools
if (config.get("env") !== "production") {
  // https://expressjs.com/en/resources/middleware/cors.html
  // https://medium.com/swlh/simple-steps-to-fix-cors-error-a2029f9b257a
  app.use(cors());
}
// The default size limit for a request body is 100kb
// IGC-Files can easily exceed this limit
app.use(express.urlencoded({ limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));

// Routes
app.get(
  "/api",
  (_req: Request, res: Response): Response =>
    res.json({ info: "Welcome to the XCCup API" })
);
app.use("/api", routes);

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
