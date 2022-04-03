const morgan = require("morgan");
const config = require("./env-config").default;
const logger = require("./logger").default;

// dev format also colorizes status code which leads to ASCII color codes when logging to a file
const morganLogFormat = config.get("env") === "development" ? "dev" : "tiny";

const morganLogger = morgan(morganLogFormat, {
  stream: {
    write: (text) => {
      logger.info(text);
    },
  },
});

module.exports = morganLogger;
