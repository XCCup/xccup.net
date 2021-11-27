const rateLimit = require("express-rate-limit");

function createLimiter(windowMinutes, maxRequestsInWindow) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max:
      process.env.DISABLE_API_PROTECTION === "true" ? 0 : maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
