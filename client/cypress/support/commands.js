// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import "cypress-file-upload";

Cypress.Commands.add("seedDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed");
});

Cypress.Commands.add("seedFlightDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed?Flight=true");
});

Cypress.Commands.add("clearDb", () => {
  cy.request("http://localhost:3000/api/testdata/clear");
});

Cypress.Commands.add("clickButtonInModal", (modalSelector, buttonText) => {
  // TODO: Find a better solution without a hard coded wait.
  // Unfornually the bootstrap modal takes some time to load all its functionality. Without the wait the modal will not dispose after clicking.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get(modalSelector).find("button").contains(buttonText).click();
});

Cypress.Commands.add("loginAdminUser", () => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type("Camille@Schaden.name");
  cy.get("input#password").type("PW_CamilleSchaden");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Camille");
});

Cypress.Commands.add("loginNormalUser", () => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type("Ramona@Gislason.name");
  cy.get("input#password").type("PW_RamonaGislason");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
});

Cypress.Commands.add("login", (email, password) => {
  cy.get("#loginNavButton").click();

  cy.get("input#email").type(email);
  cy.get("input#password").type(password);

  cy.get("button").contains("Anmelden").click();
});

Cypress.Commands.add("logout", () => {
  cy.get("#userNavDropdownMenu").click();
  cy.get("button").contains("Abmelden").click();
});
