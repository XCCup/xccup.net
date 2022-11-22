// Why do we use "require" instead of "import": https://github.com/cypress-io/cypress/issues/22038
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require("cypress-terminal-report/src/installLogsPrinter")(on);
      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
      });
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:8000",
  },
});
