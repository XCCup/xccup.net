const { findLast } = require("lodash");

const cache = [];

exports.push = (email) => {
  cache.push(email);
};

exports.findLatestForToUser = (toUserEmail) => {
  return findLast(cache, (e) => e.to?.includes(toUserEmail));
};
