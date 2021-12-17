import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import VueSnip from "vue-snip";

let app = createApp(App);
app.use(router);
app.use(VueSnip);

app.mount("#app");
