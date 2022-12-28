/**
 * Logs in a user with a role of "Administrator" (Camille Schaden).
 */
Cypress.Commands.add("loginAdminUser", () => {
  cy.visit("/");
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type("steph@xccup.net");
  cy.get("input#password").type("PW_CamilleSchaden");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Camille");
});

/**
 * Logs in a user with no role (Ramona Gislason).
 */
Cypress.Commands.add("loginNormalUser", () => {
  cy.visit("/");
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type("blackhole+ramona@xccup.net");
  cy.get("input#password").type("PW_RamonaGislason");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
});

/**
 * Logs a user with the provided email and password in to the website.
 */
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type(email);
  cy.get("input#password").type(password);

  cy.get("button").contains("Anmelden").click();
  // Wait will landing page was successfully loaded; Prevent to fast transition to another after login
  cy.get("h1").should("includes.text", "XCCup");
});

/**
 * Logs the current user user out of the website.
 */
Cypress.Commands.add("logout", () => {
  cy.visit("/");
  cy.get("#userNavDropdownMenu").click();
  cy.get("li").contains("Abmelden").click();
  cy.get("#loginNavButton").should("includes.text", "Login");
});
