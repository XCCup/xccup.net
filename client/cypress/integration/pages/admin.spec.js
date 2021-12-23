describe("check admin page", () => {
  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit("/");
    cy.loginAdminUser();
    cy.visit("/admin");
  });

  it("test accessing as non admin user", () => {
    cy.logout();
    cy.login("Clinton@Hettinger.name", "PW_ClintonHettinger");
    cy.visit("/admin");
    cy.url().should("include", "/").and("not.include", "/admin");
  });

  it("test general page loading", () => {
    cy.get("h3").should("have.text", `Kommandozentrale`);
  });

  it("test loaded unchecked flights", () => {
    cy.get("#adminFlightsPanel")
      .find("table")
      .find("tr")
      .its("length")
      .should("eq", 2);
  });

  it("test accept flight", () => {
    const userOfFlightToAccept = "Olive Emmerich";

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", userOfFlightToAccept)
        .parent()
        .find("td")
        .eq(6)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalFlightConfirm", "Akzeptieren");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", userOfFlightToAccept)
      .should("not.exist");
  });

  it("test delete flight", () => {
    const userOfFlightToAccept = "Lois White";

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", userOfFlightToAccept)
        .parent()
        .find("td")
        .eq(7)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalFlightConfirm", "Löschen");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", userOfFlightToAccept)
      .should("not.exist");
  });

  it("test loaded news flights", () => {
    cy.get("#adminNewsPanel")
      .find("table")
      .find("tr")
      .its("length")
      .should("eq", 3);
  });
});
