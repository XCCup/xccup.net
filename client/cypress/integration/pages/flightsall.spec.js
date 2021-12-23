describe("check flights all page", () => {
  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit("/fluege");
  });

  it("test no filter no sorting", () => {
    const expectedLength = 40;

    cy.get("table").find("tr").its("length").should("eq", expectedLength);
    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Sonia Harber")
      .and("include.text", "1. Pfälzer DGFC")
      .and("include.text", "Die Möwen")
      .and("include.text", "Rosenberg")
      .and("include.text", "Enzo 3")
      .and("include.text", "32 km")
      .and("include.text", "178 P");
  });

  it("test filter", () => {
    const expectedName = "Bobby Volkman";
    const expectedClub = "Die Moselfalken";
    const expectedTeam = "Die Elstern";
    const expectedRanking = "GS Sport";
    const expectedSite = "Adelberg";
    const expectedLength = 2;

    cy.get("#filterButton").click();

    // TODO: Test filters more?
    cy.get("#filterSelectName").select(expectedName);
    cy.get("#filterSelectClub").select(expectedClub);
    cy.get("#filterSelectTeam").select(expectedTeam);
    cy.get("#filterSelectRanking").select(expectedRanking);
    cy.get("#filterSelectRanking").select(expectedRanking);
    cy.get("#filterSelectSite").select(expectedSite);

    cy.get("[data-cy=activate-filter-button]").click();
    cy.get("[data-cy=filter-icon]").should("be.visible");

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */

    cy.get("[data-cy=filter-badge-clubId]").should("contain", expectedClub);
    cy.get("[data-cy=filter-badge-teamId]").should("contain", expectedTeam);
    cy.get("[data-cy=filter-badge-rankingClass]").should(
      "contain",
      expectedRanking
    );
    cy.get("[data-cy=filter-badge-siteId]").should("contain", expectedSite);
    cy.get("[data-cy=no-flights-listed]").should(
      "contain",
      "Keine Flüge gemeldet in diesem Jahr"
    );

    cy.get("[data-cy=filter-badge-siteId]").within(() => {
      cy.get("[data-cy=filter-clear-one-button]").click();
    });
    // cy.get("[data-cy=filter-icon]").should("be.visible");

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */

    cy.get("table").find("tr").should("have.length", expectedLength);

    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", expectedName)
      .and("include.text", "Die Moselfalken")
      .and("include.text", "Die Elstern")
      .and("include.text", "Ockfen")
      .and("include.text", "Sky Apollo")
      .and("include.text", "48 km")
      .and("include.text", "289 P");
  });

  it("test sort on points ascending", () => {
    const expectedName = "Ramona Gislason";
    const expectedLength = 40;

    cy.get("th").contains("Punkte").click();
    cy.get("[data-cy=filter-icon]").should("be.visible");
    cy.get("th").contains("Punkte").click();
    // cy.get("[data-cy=filter-icon]").should("be.visible");

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */
    cy.get("[data-cy=filter-icon]").should("be.visible");
    cy.get("table").find("tr").should("have.length", expectedLength);

    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", expectedName)
      .and("include.text", "Die Adler")
      .and("include.text", "Wixberg")
      .and("include.text", "XC Racer")
      .and("include.text", "4 km")
      .and("include.text", "27 P");
  });

  it("test pagination show last and limit 10", () => {
    const expectedName = "Leo Altenwerth";
    const expectedLength = 10;

    cy.get("#cyPaginationAmountSelect").select("10");
    cy.get("[data-cy=filter-icon]").should("be.visible");

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */
    cy.get("table").find("tr").should("have.length", expectedLength);
    cy.get(".page-item").last().click();
    cy.get("[data-cy=filter-icon]").should("be.visible");

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */
    cy.get("table")
      .find("tr")
      .last()
      .should("include.text", expectedName)
      .and("include.text", "Die Möwen")
      .and("include.text", "Boppard")
      .and("include.text", "Sky Apollo")
      .and("include.text", "10 km")
      .and("include.text", "65 P");
  });
});
