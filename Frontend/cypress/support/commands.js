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

Cypress.Commands.add("login", (email, password) => {
  //TODO: @Steph any reason for this cryptic name of the login button?
  cy.get("#dropdownMenuButton1").click();

  cy.get("input#email").type(email);
  cy.get("input#password").type(password);

  cy.get("button").contains("Anmelden").click();
});

Cypress.Commands.add("logoff", () => {
  cy.get("#dropdownMenuButton1").click();
  cy.get("button").contains("Abmelden").click();
});
