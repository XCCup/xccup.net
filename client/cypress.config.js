import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";
import cypressPlugins from "./cypress/plugins/index.js";

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      installLogsPrinter(on);
      return cypressPlugins(on, config);
    },
    baseUrl: "http://localhost:8000",
    experimentalRunAllSpecs: true,
  },
});
