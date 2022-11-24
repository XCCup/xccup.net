describe("check flyingsites page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  // it("test add new site button not visible if not logged in", () => {
  //   cy.visit("/fluggebietsmeldung");

  //   cy.get("h3").should("have.text", "Fluggebiets vorschlagen");
  //   cy.get("[data-cy=add-site-button]").should("not.exist");
  //   cy.get("#mapContainer").should("exist");
  // });

  it("test site access only allowed for logged in users", () => {
    cy.visit("/fluggebietsmeldung");

    cy.location("pathname").should("eq", "/login");
  });

  it("test propose new site and find it in admin site panel", () => {
    const expectedName = "Laacher See";
    const expectedDirection = "S/N";
    const expectedWebsite = "www.laacher-see.de";
    const expectedClub = "DFC Vulkaneifel";
    const expectedHeightDifference = "123";
    const expectedLat = "50.413106647";
    const expectedLong = "7.270120454";

    cy.loginAdminUser();
    cy.visit("/fluggebietsmeldung");

    // Create a new proposal
    cy.get("#club-select").select(expectedClub);
    cy.get("#site-name").type(expectedName);
    cy.get("#site-direction").type(expectedDirection);
    cy.get("#site-website").type(expectedWebsite);
    cy.get("#site-height").type(expectedHeightDifference);
    cy.get("#site-lat").type(expectedLat);
    cy.get("#site-long").type(expectedLong);

    cy.get("button").contains("Vorschlagen").click();

    // Find the proposed site
    cy.visit("/admin");
    cy.get("#nav-sites-tab").click();

    cy.get("#adminSitesPanel").within(() => {
      cy.get("[data-cy=site-name]").contains(expectedName);
      cy.get("[data-cy=site-direction]").contains(expectedDirection);
      cy.get("[data-cy=site-heightDifference]").contains(
        expectedHeightDifference
      );
      cy.get("[data-cy=site-club]").contains(expectedClub);
      cy.get("[data-cy=site-name]").contains(expectedName);
    });

    // Accept the proposed site
    cy.get(
      ':nth-child(2) > :nth-child(10) > [data-cy="site-accept"] > .bi'
    ).click();
    // cy.get(":nth-child(2)]").within(() => {
    //   cy.get("[data-cy=site-accept]").click();
    // });

    cy.clickButtonInModal("#modalSiteConfirm", "Akzeptieren");

    // Check that the former proposed site is no longer listed
    cy.get("#adminSitesPanel")
      .find("table")
      .contains("td", expectedName)
      .should("not.exist");
  });
});
