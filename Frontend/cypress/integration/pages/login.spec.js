describe("check landing page", () => {
  before(() => {
    cy.visit("/");
  });

  it("login/logout normal user", () => {
    cy.login("Clinton@Hettinger.name", "PW_ClintonHettinger");

    cy.get("#loginMenuButton").should("includes.text", "Clinton");
    cy.get("#navbarAdminDashboard").should("not.exist");

    cy.logout();

    cy.get("#loginMenuButton").should("includes.text", "Login");
  });

  it("login/logout admin", () => {
    cy.login("Camille@Schaden.name", "PW_CamilleSchaden");

    cy.get("#loginMenuButton").should("includes.text", "Camille");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logout();

    cy.get("#loginMenuButton").should("includes.text", "Login");
  });

  it("login/logout moderator", () => {
    cy.login("Olive@Emmerich.biz", "PW_OliveEmmerich");

    cy.get("#loginMenuButton").should("includes.text", "Olive");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logout();

    cy.get("#loginMenuButton").should("includes.text", "Login");
  });

  it("login non exisiting user", () => {
    cy.login("noone@neverland.it", "FancyPassword");

    cy.get("button").contains("Anmelden").click();

    //TODO: Test should fail an purpose because this isn't implemented
    cy.location("localhost:8000/register");
  });
});
