describe("check login options", () => {
  before(() => {
    cy.visit("/");
  });

  it("login/logout normal user", () => {
    cy.login("blackhole+clinton@stephanschoepe.de", "PW_ClintonHettinger");

    cy.get("#userNavDropdownMenu").should("includes.text", "Clinton");
    cy.get("#navbarAdminDashboard").should("not.exist");

    cy.logout();

    cy.get("#loginNavButton").should("includes.text", "Login");
  });

  it("login/logout admin", () => {
    cy.login("xccup-beta@stephanschoepe.de", "PW_CamilleSchaden");

    cy.get("#userNavDropdownMenu").should("includes.text", "Camille");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logout();

    cy.get("#loginNavButton").should("includes.text", "Login");
  });

  it("login/logout moderator", () => {
    cy.login("blackhole+olive@stephanschoepe.de", "PW_OliveEmmerich");

    cy.get("#userNavDropdownMenu").should("includes.text", "Olive");
    cy.get("#navbarAdminDashboard").should("exist");

    cy.logout();

    cy.get("#loginNavButton").should("includes.text", "Login");
  });

  it("login with wrong user/pw combination", () => {
    cy.get("#loginNavButton").click();
    cy.url().should("include", "/login");

    cy.get("input#email").type("noone@neverland.fake");
    cy.get("input#password").type("FancyPassword");

    cy.get("button").contains("Anmelden").click();

    cy.get("#loginErrorMessage").should(
      "includes.text",
      "Benutzername/Passwort falsch"
    );
  });
});
