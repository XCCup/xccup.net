import { defaultUrl } from "@googlemaps/google-maps-services-js/dist/directions";
import morgan from "morgan";
import config from "./env-config";
import logger from "./logger";

// dev format also colorizes status code which leads to ASCII color codes when logging to a file
const morganLogFormat = config.get("env") === "development" ? "dev" : "tiny";

const morganLogger = morgan(morganLogFormat, {
  stream: {
    write: (text) => {
      logger.info(text);
    },
  },
});

export default morganLogger;
