import morgan from "morgan";
import config from "./env-config";
import logger from "./logger";

const format =
  ":remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms";
// dev format also colorizes status code which leads to ASCII color codes when logging to a file
const morganLogFormat = config.get("env") === "development" ? "dev" : format;

interface BlackListRoute {
  method: "GET" | "POST"; // Add more when needed
  path: string;
}

const blackListedRoutes: BlackListRoute[] = [{ method: "GET", path: "/media" }];

const morganLogger = morgan(morganLogFormat, {
  skip: (req, res) => {
    // Always log in debugging mode
    if (config.get("logLevel") == "debug") return false;

    const found = blackListedRoutes.find(
      // @ts-ignore req.originalURL is there…
      (r) => r.method == req.method && req.originalUrl.includes(r.path)
    );
    // Don't log if entry is found on black list and status code is < 400
    return found != null && res.statusCode < 400;
  },
  stream: {
    write: (text) => {
      logger.info(text);
    },
  },
});

export default morganLogger;
