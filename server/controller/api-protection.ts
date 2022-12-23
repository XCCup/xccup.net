import rateLimit from "express-rate-limit";
import config from "../config/env-config";

export function createLimiter(
  windowMinutes: number,
  maxRequestsInWindow: number
) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: config.get("disableApiProtection") ? 0 : maxRequestsInWindow,
  });
}

exports.createRateLimiter = createLimiter;
