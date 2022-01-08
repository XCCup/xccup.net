describe("check admin page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
    cy.loginAdminUser();
    cy.visit("/admin");
  });

  it("test accessing as non admin user", () => {
    cy.logout();
    cy.login("blackhole+clinton@stephanschoepe.de", "PW_ClintonHettinger");
    cy.get("#userNavDropdownMenu").should("have.text", "Clinton");
    cy.visit("/admin");

    // Non admins should be redirected to the landing page
    cy.url().should("not.contain", "/admin");
    cy.get("h1").should("have.text", `XCCup ${new Date().getFullYear()}`);
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

  it("test delete proposed flying site", () => {
    const expectedName = "Nur ein Vorschlag";

    cy.get("#adminSitesPanel").within(() => {
      cy.get("table")
        .contains("td", expectedName)
        .parent()
        .find("td")
        .eq(9)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalSiteConfirm", "Löschen");

    // Table will only be shown if there is at least one entry
    cy.get("#adminFlightsPanel").find("table").should("not.exist");
  });

  it("test loaded news flights", () => {
    cy.get("#adminNewsPanel")
      .find("table")
      .find("tr")
      .its("length")
      .should("eq", 3);
  });
});
