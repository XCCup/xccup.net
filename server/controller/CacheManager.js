const NodeCache = require("node-cache");
const logger = require("../config/logger");

const FLIGHT_RELATED_KEYS = ["home", "results", "flights"];

// All cache elements will be deleted after one week
const cache = new NodeCache({
  stdTTL: 60 * 60 * 24 * 7,
  checkperiod: 60 * 60 * 6,
});

const getCache = (req) => {
  const value = cache.get(req.originalUrl);
  if (value) {
    logger.debug("access from cache: " + req.originalUrl);
    return value;
  }
};

const setCache = (req, value) => {
  cache.set(req.originalUrl, value);
};

const deleteCache = (keysArrayToDelete, deleteAlsoFlightRelatedKeys) => {
  const cachedKeys = cache.keys();
  const keysToDelete = [];

  if (deleteAlsoFlightRelatedKeys) {
    keysArrayToDelete = [...keysArrayToDelete, ...FLIGHT_RELATED_KEYS];
  }

  cachedKeys.forEach((cacheKey) => {
    keysArrayToDelete.forEach((includeKey) => {
      if (cacheKey.includes(includeKey)) return keysToDelete.push(cacheKey);
    });
  });

  logger.debug("Will delete these keys from cache: " + keysToDelete);

  return cache.del(keysToDelete);
};

const listCache = () => {
  return cache.keys();
};

const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cache,
  getCache,
  setCache,
  deleteCache,
  listCache,
  getCacheStats,
};
