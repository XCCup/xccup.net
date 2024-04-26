import NodeCache from "node-cache";
import logger from "../config/logger";

// All cache elements will be deleted after one week
export const cache = new NodeCache({
  stdTTL: 60 * 60 * 24 * 7,
  checkperiod: 60 * 60 * 6,
});

export const getCache = (req: { originalUrl: string }) => {
  const value = cache.get(req.originalUrl);
  if (value) {
    logger.debug("access from cache: " + req.originalUrl);
    return value;
  }
};

export const setCache = (req: { originalUrl: string }, value: any) => {
  cache.set(req.originalUrl, value);
};

export const deleteCache = (keysArrayToDelete: string[]) => {
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

export const listCache = () => {
  return cache.keys();
};

export const getCacheStats = () => {
  return cache.getStats();
};
