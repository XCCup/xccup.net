import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

let app = createApp(App);

Sentry.init({
  app,
  dsn: "https://a507e855de954c6180a96b028d9a898b@o1179689.ingest.sentry.io/6291948",
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ["localhost", "xccup.net", /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  logErrors: true,
});

app.use(router);
app.mount("#app");
