const logger = require("../config/logger");

let homeCache;
let currentYearFlightCache;

const manager = {
  invalidateCaches: () => {
    logger.info("Clear all caches");
    homeCache = null;
    currentYearFlightCache = null;
  },
  getHomeCache: () => {
    logger.info("Access data from homeCache");
    return homeCache;
  },
  getCurrentYearFlightCache: () => {
    logger.info("Access data from currentYearFlightCache");
    return currentYearFlightCache;
  },
  setHomeCache: (data) => {
    logger.info("Write data to homeCache");
    homeCache = data;
  },
  setCurrentYearFlightCache: (data) => {
    logger.info("Write data to currentYearFlightCache");
    currentYearFlightCache = data;
  },
};

module.exports = manager;
