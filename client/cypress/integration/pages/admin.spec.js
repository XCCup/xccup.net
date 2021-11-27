describe("check admin page", () => {
  before(() => {
    cy.seedFlightDb();
    cy.visit("/");
    cy.loginAdminUser();
    cy.visit("/admin");
    // cy.get("#navbarAdminDashboard").click();
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
    const idOfFlightToAccept = 18;

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", idOfFlightToAccept)
        .parent()
        .find("td")
        .eq(6)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalFlightConfirm", "Akzeptieren");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", idOfFlightToAccept)
      .should("not.exist");
  });

  it("test delete flight", () => {
    const idOfFlightToDelete = 19;

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", idOfFlightToDelete)
        .parent()
        .find("td")
        .eq(7)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalFlightConfirm", "Löschen");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", idOfFlightToDelete)
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
