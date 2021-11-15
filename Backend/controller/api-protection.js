const rateLimit = require("express-rate-limit");

function createLimiter(windowMinutes, maxRequestsInWindow) {
  return rateLimit({
    windowMs: process.env.DISABLE_API_PROTECTION
      ? Number.MAX_SAFE_INTEGER
      : windowMinutes * 60 * 1000,
    max: process.env.DISABLE_API_PROTECTION
      ? Number.MAX_SAFE_INTEGER
      : maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
