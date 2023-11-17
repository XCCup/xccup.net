import rateLimit from "express-rate-limit";
import config from "../config/env-config";

export function createLimiter(
  windowMinutes: number,
  maxRequestsInWindow: number
) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: config.get("disableApiProtection")
      ? Number.MAX_SAFE_INTEGER
      : maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
