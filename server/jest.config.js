/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-tests.js"],
  // Only needed b/c igc-parser fork contains non build ts files
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!igc-parser/)"],
};
