const rateLimit = require("express-rate-limit");

function createLimiter(windowMinutes, maxRequestsInWindow) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
