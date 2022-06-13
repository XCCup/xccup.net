import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000',
    excludeSpecPattern: [
      '**/integration/1-getting-started/*',
      '**/integration/2-advanced-examples/*',
    ],
  },
})
