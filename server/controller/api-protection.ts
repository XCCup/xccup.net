import rateLimit from "express-rate-limit";

function createLimiter(windowMinutes: number, maxRequestsInWindow: number) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max:
      process.env.DISABLE_API_PROTECTION === "true" ? 0 : maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
