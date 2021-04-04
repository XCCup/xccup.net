import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";

// Import Base Components
const requireComponent = require.context(
  "./components",
  false,
  /Base[A-Z]\w+\.(vue|js)$/
);

let app = createApp(App).use(router);

// Also required for Base components
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, "$1"))
  );

  app.component(componentName, componentConfig.default || componentConfig);
});

app.mount("#app");
