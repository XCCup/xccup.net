describe("check flyingsites page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("test add new site button not visible if not logged in", () => {
    cy.visit("/fluggebiete");

    cy.get("h3").should("have.text", "Fluggebietsübersicht");
    cy.get("[data-cy=add-site-button]").should("not.exist");
    cy.get("#mapContainer").should("exist");
  });

  it("test propose new site and find it in admin site panel", () => {
    const expectedName = "Laacher See";
    const expectedDirection = "S/N";
    const expectedWebsite = "www.laacher-see.de";
    const expectedClub = "DFC Vulkaneifel";
    const expectedHeight = "123";
    const expectedLat = "50.413106647";
    const expectedLong = "7.270120454";

    cy.loginAdminUser();
    cy.visit("/fluggebiete");

    // Create a new proposal
    cy.get("[data-cy=add-site-button]").click();

    cy.get("#club-select").select(expectedClub);
    cy.get("#site-name").type(expectedName);
    cy.get("#site-direction").type(expectedDirection);
    cy.get("#site-website").type(expectedWebsite);
    cy.get("#site-height").type(expectedHeight);
    cy.get("#site-lat").type(expectedLat);
    cy.get("#site-long").type(expectedLong);

    cy.get("button").contains("Vorschlagen").click();

    // Find the proposed site
    cy.visit("/admin");

    cy.get("#adminSitesPanel").within(() => {
      cy.get("table")
        .contains("td", expectedName)
        .parent()
        .should("include.text", expectedDirection)
        .and("include.text", expectedWebsite)
        .and("include.text", expectedClub)
        // .and("include.text", expectedHeight) Too many columns?
        .and("include.text", expectedLat)
        .and("include.text", expectedLong);
    });

    // Accept the proposed site
    cy.get("#adminSitesPanel").within(() => {
      cy.get("table")
        .contains("td", expectedName)
        .parent()
        .find("td")
        .eq(8)
        .find("button")
        .click();
    });

    cy.get("button").contains("Akzeptieren").click();

    // Check that the former proposed site is no longer listed
    cy.get("#adminSitesPanel")
      .find("table")
      .contains("td", expectedName)
      .should("not.exist");
  });
});
