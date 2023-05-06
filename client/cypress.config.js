import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      installLogsPrinter(on);
    },
    baseUrl: "http://localhost:8000",
    experimentalRunAllSpecs: true,
  },
});
