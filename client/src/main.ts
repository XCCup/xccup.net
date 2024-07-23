import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { createApp } from "vue";
import App from "./App.vue";
import { plausible } from "./config/plausible";
import { initSentry } from "./config/sentry";
import router from "./router";

const app = createApp(App);

if (import.meta.env.MODE == "production") {
  initSentry(app, router);

  // Deactivate in non-production.
  // Using this with a non valid setup will cause e.g. bugs when interacting with GLightbox.
  app.use(plausible);
}

app.use(router);
app.mount("#app");
