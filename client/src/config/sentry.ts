import { BrowserTracing } from "@sentry/browser";
import * as Sentry from "@sentry/vue";
import { App } from "vue";
import { Router } from "vue-router";

export const initSentry = (app: App<Element>, router: Router) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_URL,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: [
          "localhost",
          "xccup.net",
          "render.xccup.net",
          /^\//,
        ],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    logErrors: true,
  });
};
