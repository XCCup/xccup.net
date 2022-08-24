import morgan from "morgan";
import config from "./env-config";
import logger from "./logger";

// dev format also colorizes status code which leads to ASCII color codes when logging to a file
const morganLogFormat = config.get("env") === "development" ? "dev" : "tiny";

interface BlackListRoute {
  method: string;
  path: string;
}

const blackListedRoutes: BlackListRoute[] = [{ method: "GET", path: "/media" }];

const morganLogger = morgan(morganLogFormat, {
  skip: (req, res) => {
    // Always log in debugging mode
    if (config.get("logLevel") == "debug") return false;

    const found = blackListedRoutes.find(
      // @ts-ignore
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
