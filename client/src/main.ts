import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import * as Sentry from "@sentry/vue";
import { plausible } from "./config/plausible";

const app = createApp(App);

if (import.meta.env.MODE == "production") {
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
}

app.use(plausible);
app.use(router);
app.mount("#app");
