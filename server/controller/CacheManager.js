const NodeCache = require("node-cache");
const logger = require("../config/logger");

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

const deleteCache = (keysArrayToDelete) => {
  const cachedKeys = cache.keys();
  const keysToDelete =
    keysArrayToDelete[0] == "all"
      ? cachedKeys
      : cachedKeys.filter((ck) =>
          keysArrayToDelete.some((includeKey) => ck.includes(includeKey))
        );

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
