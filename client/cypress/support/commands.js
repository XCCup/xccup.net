import "cypress-file-upload";

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

/**
 * Unfornually the bootstrap modal takes some time to load all its functionality. Without the wait it could be possible that the modal will not dispose after clicking.
 * Use this command to a add a wait() before clicking.
 */
Cypress.Commands.add("clickButtonInModal", (modalSelector, buttonText) => {
  // TODO: Find a better solution without a hard coded wait.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get(modalSelector).find("button").contains(buttonText).click();
});

/**
 * Logs in a user with a role of "Administrator" (Camille Schaden).
 */
Cypress.Commands.add("loginAdminUser", () => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type("xccup-beta@stephanschoepe.de");
  cy.get("input#password").type("PW_CamilleSchaden");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Camille");
});

/**
 * Logs in a user with no role (Ramona Gislason).
 */
Cypress.Commands.add("loginNormalUser", () => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type("blackhole+ramona@stephanschoepe.de");
  cy.get("input#password").type("PW_RamonaGislason");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
});

/**
 * Logs a user with the provided email and password in to the website.
 */
Cypress.Commands.add("login", (email, password) => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type(email);
  cy.get("input#password").type(password);

  cy.get("button").contains("Anmelden").click();
});

/**
 * Logs the current user user out of the website.
 */
Cypress.Commands.add("logout", () => {
  cy.get("#userNavDropdownMenu").click();
  cy.get("li").contains("Abmelden").click();
  cy.get("#loginNavButton").should("includes.text", "Login");
});

/**
 * A command to verify if a textarea includes a provided text.
 */
Cypress.Commands.add("textareaIncludes", function (selector, text) {
  cy.get(selector).invoke("val").should("contains", text);
});
