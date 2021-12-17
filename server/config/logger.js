const { createLogger: createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, json } = format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logLevel = process.env.SERVER_LOG_LEVEL ?? "info";
const dataPath = process.env.SERVER_DATA_PATH ?? "data";
const logsPath = "logs";

const createDevLogger = createLogger({
  level: logLevel,
  format: combine(
    colorize(),
    timestamp(),
    format.errors({ stack: true }),
    devFormat
  ),
  transports: [new transports.Console()],
});

const createProdLogger = createLogger({
  level: logLevel,
  format: combine(timestamp(), format.errors({ stack: true }), json()),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `${dataPath}/${logsPath}/error_log.log`,
      level: "error",
    }),
    new transports.File({ filename: `${dataPath}/${logsPath}/log.log` }),
  ],
});

const logger =
  process.env.NODE_ENV === "development" ? createDevLogger : createProdLogger;

const morgan = require("morgan");
const morganLogger = morgan("dev", {
  stream: {
    write: (text) => {
      logger.info(text);
    },
  },
});

module.exports = logger;
module.exports.morganLogger = morganLogger;
