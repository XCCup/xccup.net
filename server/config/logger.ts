import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, json } = format;
import morgan from "morgan";
import config from "./env-config";

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logLevel = config.get("logLevel");
const dataPath = config.get("dataPath");
const logsPath = "logs";

const createDevLogger = createLogger({
  level: logLevel,
  format: combine(
    colorize(),
    timestamp(),
    format.errors({ stack: true }),
    devFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `${dataPath}/${logsPath}/error_log.log`,
      level: "error",
    }),
  ],
});

const createProdLogger = createLogger({
  level: logLevel,
  format: combine(timestamp(), format.errors({ stack: true }), json()),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `${dataPath}/${logsPath}/error_log.log`,
      level: "error",
      // colorize: false,
    }),
    new transports.File({
      filename: `${dataPath}/${logsPath}/log.log`,
      // colorize: false,
    }),
  ],
});

const logger =
  config.get("env") === "development" ? createDevLogger : createProdLogger;

export const morganLogger = morgan("dev", {
  stream: {
    write: (text) => {
      logger.info(text);
    },
  },
});

export default logger;