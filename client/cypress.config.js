import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter.js";

export default defineConfig({
  allowCypressEnv: false,
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  retries: {
    runMode: 2,
  },
  e2e: {
    setupNodeEvents(on) {
      installLogsPrinter(on);
    },
    baseUrl: "http://localhost:8000",
    experimentalRunAllSpecs: true,
  },
});
