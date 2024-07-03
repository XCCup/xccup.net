import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/browser";
import { createPlausible } from "v-plausible/vue";

const app = createApp(App);

if (import.meta.env.MODE == "production") {
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
}

const plausible = createPlausible({
  init: {
    domain: "xccup.net",
    apiHost: import.meta.env.VITE_PLAUSIBLE_API_HOST,
    trackLocalhost: false,
  },
  settings: {
    enableAutoOutboundTracking: true,
    enableAutoPageviews: true,
  },
  partytown: false,
});

app.use(plausible);
app.use(router);
app.mount("#app");
