const { findLast } = require("lodash");
const logger = require("../config/logger");

const cache = [];

exports.push = (email) => {
  cache.push(email);
  logger.error("Add mail");
  logger.error(email);
};

exports.findLatestForToUser = (toUserEmail) => {
  logger.error("Get last mail: ", toUserEmail);
  logger.error(findLast(cache, (e) => e.to?.includes(toUserEmail)));

  return findLast(cache, (e) => e.to?.includes(toUserEmail));
};
