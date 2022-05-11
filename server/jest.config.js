/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-tests.js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
