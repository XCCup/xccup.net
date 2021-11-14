describe("check landing page", () => {
  before(() => {
    cy.visit("/");
  });

  it("login/logoff normal user", () => {
    cy.login("Clinton@Hettinger.name", "PW_ClintonHettinger");

    cy.get("#dropdownMenuButton1").should("includes.text", "Clinton");
    cy.get("#navbarAdminDashboard").should("not.exist");

    cy.logoff();

    cy.get("#dropdownMenuButton1").should("includes.text", "Login");
  });

  it("login/logoff admin", () => {
    cy.login("Camille@Schaden.name", "PW_CamilleSchaden");

    cy.get("#dropdownMenuButton1").should("includes.text", "Camille");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logoff();

    cy.get("#dropdownMenuButton1").should("includes.text", "Login");
  });

  it("login/logoff moderator", () => {
    cy.login("Olive@Emmerich.biz", "PW_OliveEmmerich");

    cy.get("#dropdownMenuButton1").should("includes.text", "Olive");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logoff();

    cy.get("#dropdownMenuButton1").should("includes.text", "Login");
  });

  it("login non exisiting user", () => {
    cy.login("noone@neverland.it", "FancyPassword");

    cy.get("button").contains("Anmelden").click();

    //TODO: Test should fail an purpose because this isn't implemented
    cy.location("localhost:8000/register");
  });
});
