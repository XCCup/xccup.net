import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import config from "./env-config";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: config.get("sentryUrl"),
  integrations: [
    // Add our Profiling integration
    // @ts-expect-error
    nodeProfilingIntegration(),
  ],
  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
