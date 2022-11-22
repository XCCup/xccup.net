const { findLast } = require("lodash");
const logger = require("../config/logger");

const cache = [];

exports.push = (email) => {
  if (!email) return logger.error("No content");
  cache.push(email);
  logger.error("Add mail to cache: " + email.to);
};

exports.findLatestForToUser = (toUserEmail) => {
  if (!toUserEmail) return logger.error("No email specified");
  logger.error("Get last mail from cache: " + toUserEmail);
  logger.error(findLast(cache, (e) => e.to?.includes(toUserEmail)));

  return findLast(cache, (e) => e.to?.includes(toUserEmail));
};
