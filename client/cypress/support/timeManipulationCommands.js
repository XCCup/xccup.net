/**
 * Sets the time on the backend system.
 */
Cypress.Commands.add("setBackendTime", (timestamp) => {
  cy.request("http://localhost:3000/api/testdata/time/set/" + timestamp);
});

/**
 * Resets the time on the backend system.
 */
Cypress.Commands.add("resetBackendTime", () => {
  cy.request("http://localhost:3000/api/testdata/time/reset");
});

/**
 * Freezes the time on the backend system.
 */
Cypress.Commands.add("freezeBackendTime", () => {
  cy.request("http://localhost:3000/api/testdata/time/freeze");
});
