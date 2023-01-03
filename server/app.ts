// Load server config
import config from "./config/env-config";
import * as Sentry from "@sentry/node";

// Setup DB
import "./db";

import express, { Application, Request, Response } from "express";
import routes from "./routes";

import logger from "./config/logger";
import requestLogger from "./config/request-logger";
import { handleError } from "./helper/ErrorHandler";

import compression from "compression";
import cors from "cors";
import { authToken } from "./controller/Auth";

// Set timezone of node server
process.env.TZ = config.get("timezone");

const app: Application = express();

// Start Cron Jobs
import "./cron/CleanIgcStore";
import "./cron/DailyWinnerEMail";
import "./cron/CleanTokenStore";

// Sentry
if (config.get("env") == "production") {
  logger.info("Sentry set up");
  Sentry.init({ dsn: config.get("sentryUrl") });
  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
}
// When running an Express app behind a reverse proxy, some of the Express APIs may return different values than expected.
// In order to adjust for this, the trust proxy application setting may be used to expose information provided by the reverse proxy in the Express APIs.
app.enable("trust proxy");

// Log all requests
app.use(requestLogger);

// Basic auth check
app.use(authToken);

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
  app.use(cors());
} else {
  // Allow alternative client on render.com
  app.use(cors({ origin: "https://render.xccup.net" }));
}
// The default size limit for a request body is 100kb
// IGC-Files can easily exceed this limit
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json({ limit: "5mb" }));

// Routes
app.get(
  "/api",
  (_req: Request, res: Response): Response =>
    res.json({ info: "Welcome to the XCCup API" })
);
app.use("/api", routes);

// Handle calls to non existing routes
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

// Sentry
if (config.get("env") == "production") {
  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
}

// Handle global errors on requests. Endpoints have to forward the error to their own next() function!
app.use(handleError);

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
