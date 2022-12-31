/**
 * Clears and reseeds the whole Database.
 */
Cypress.Commands.add("seedDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed");
});

/**
 * Clears and reseeds only flight depending data in the database (Tables: Flight, FlightFixes, FlightComments, FlightPhoto).
 */
Cypress.Commands.add("seedFlightDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed?Flight=true");
});

/**
 * Clears the whole database. No app releated data will be left.
 */
Cypress.Commands.add("clearDb", () => {
  cy.request("http://localhost:3000/api/testdata/clear");
});
