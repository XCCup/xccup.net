// Import this first!
// import "./config/sentry";

// Load server config
import config from "./config/env-config";

// Setup DB
import "./db";

import express, { Request, Response } from "express";
import routes from "./routes";

import logger from "./config/logger";
import requestLogger from "./config/request-logger";
import { handleError } from "./helper/ErrorHandler";

import compression from "compression";
import cors from "cors";
import { authToken } from "./controller/Auth";

// Set timezone of node server
process.env.TZ = config.get("timezone");

const app = express();

// Express 5 defaults to the simple query parser, but the API accepts bracketed
// array parameters such as userIds[]=... throughout the existing client.
app.set("query parser", "extended");

// Start Cron Jobs
import "./cron/CleanIgcStore";
import "./cron/DailyWinnerEMail";
import "./cron/CleanTokenStore";

// The production service runs behind one reverse proxy. Using a bounded hop count
// also lets express-rate-limit identify clients without accepting spoofed headers.
app.set("trust proxy", 1);

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
  }) as any // TODO: Find out why…
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
app.use((_req, res) => {
  res.status(404).json({
    success: "false",
    message: "Endpoint not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

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
