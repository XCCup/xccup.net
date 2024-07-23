import * as Sentry from "@sentry/vue";
import { App } from "vue";
import { Router } from "vue-router";

export const initSentry = (app: App<Element>, router: Router) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_URL,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracePropagationTargets: [
      "localhost",
      "xccup.net",
      "render.xccup.net",
      /^\//,
    ],
    tracesSampleRate: 1.0,
    logErrors: true,
  });
};
