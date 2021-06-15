import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";
import store from "@/store";

// Import Base Components
const requireComponent = require.context(
  "./components",
  false,
  /Base[A-Z]\w+\.(vue|js)$/
);

// JWT
// router.beforeEach((to, from, next) => {
//   let authPages = ["/profil/", "/hochladen"];
//   let authRequired = authPages.includes(to.path);
//   let loggedIn = store.dispatch("auth/isLoggedIn");

//   if (authRequired && !loggedIn) {
//     return next("/login/");
//   }

//   next();
// });

let app = createApp(App);
app.use(router);
app.use(store);

// Also required for Base components
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, "$1"))
  );

  app.component(componentName, componentConfig.default || componentConfig);
});

app.mount("#app");
