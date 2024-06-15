describe("check flights all page", () => {
  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.intercept("GET", "flights*").as("get-flights");
    cy.visit("/fluege");
  });

  it("test no filter no sorting", () => {
    // By default flights will be sorted by takeoff date. This date will always change for 10 flights (5 flights to today, 5 flights to yesterday)
    const expectedLength = 41;

    cy.get("table")
      .get("tbody")
      .children()
      .its("length")
      .should("eq", expectedLength);
    cy.get("table")
      .find("tr")
      // .first()
      .should("include.text", "Sonia Harber")
      .and("include.text", "1. Pfälzer DGFC")
      .and("include.text", "Die Möwen")
      .and("include.text", "Rosenberg")
      .and("include.text", "Enzo 3")
      .and("include.text", "32 km")
      .and("include.text", "178 P");
  });

  it("test flights of previous year", () => {
    const expectedLength = 1;
    const year = new Date().getFullYear();

    cy.wait("@get-flights");
    cy.get("#select-season").should("be.visible");
    cy.get("table").should("be.visible");

    cy.visit(`${year}/fluege`);

    cy.wait("@get-flights")
      .its("request.url")
      .should("include", "/flights?year=" + year + "&limit=50");

    cy.get("#select-season").should("have.value", new Date().getFullYear());
    cy.get("#select-season").select((year - 1).toString());

    cy.wait("@get-flights");

    cy.url().should("include", `${year - 1}/fluege`);

    cy.get("[data-cy=filter-icon]").should("be.visible");
    cy.url().should("include", `${year - 1}/fluege`);

    cy.get("table")
      .get("tbody")
      .children()
      .its("length")
      .should("eq", expectedLength);
    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Leo Altenwerth")
      .and("include.text", "1. Pfälzer DGFC")
      .and("include.text", "Die Möwen")
      .and("include.text", "Boppard")
      .and("include.text", "Sky Apollo")
      .and("include.text", "10 km")
      .and("include.text", "65 P");
  });

  it("test flights of first season", () => {
    const year = 2004;

    cy.visit(`${year}/fluege`);
    cy.get("[data-cy=no-flights-listed]").should(
      "contain",
      "Keine Flüge gemeldet in diesem Jahr"
    );
  });

  it("test filter", () => {
    cy.intercept("GET", "/api/flights*").as("get-flights");

    const expectedClub = "Die Moselfalken";
    const expectedTeamBadge = "Die Elstern";
    const expectedTeamSelect =
      expectedTeamBadge + ` (${new Date().getFullYear()})`;
    const expectedRanking = "GS Sport";
    const expectedSite = "Adelberg";
    const expectedLength = 5;

    cy.get("#filterButton").click();

    // Wait for modal?
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.get("#filterSelectClub").select(expectedClub);
    cy.get("#filterSelectTeam").select(expectedTeamSelect);
    cy.get("#filterSelectRanking").select(expectedRanking);
    cy.get("#filterSelectRanking").select(expectedRanking);
    cy.get("#filterSelectSite").select(expectedSite);

    cy.get("[data-cy=activate-filter-button]").click();

    cy.wait("@get-flights");

    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("[data-cy=no-flights-listed]").should(
      "contain",
      "Keine Flüge gemeldet in diesem Jahr"
    );
    cy.get("[data-cy=filter-badge-clubId]").should("contain", expectedClub);
    cy.get("[data-cy=filter-badge-teamId]").should(
      "contain",
      expectedTeamBadge
    );
    cy.get("[data-cy=filter-badge-rankingClass]").should(
      "contain",
      expectedRanking
    );
    cy.get("[data-cy=filter-badge-siteId]").should("contain", expectedSite);

    // Remove site from filter
    cy.get("[data-cy=filter-badge-siteId]").within(() => {
      cy.get("[data-cy=filter-clear-one-button]").click({ force: true });
    });

    // Wait till table was updated
    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("table")
      .get("tbody")
      .children()
      .its("length")
      .should("eq", expectedLength);

    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Die Moselfalken")
      .and("include.text", "Die Elstern")
      .and("include.text", "Sky Apollo");
  });

  it("test sort on points ascending", () => {
    const expectedName = "Ramona Gislason";
    const expectedLength = 40;

    cy.visit(`${new Date().getFullYear()}/fluege`);

    cy.get("th").contains("Punkte").click();
    cy.get("[data-cy=filter-icon]").should("be.visible");
    cy.get("th").contains("Punkte").click();
    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("table")
      .get("tbody")
      .children()
      .its("length")
      .should("eq", expectedLength);

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
    cy.intercept("GET", "filterOptions*").as("get-filter");
    cy.intercept("GET", "flights*").as("get-flights");

    const expectedName = "Leo Altenwerth";
    const expectedLength = 10;

    cy.get("#cyPaginationAmountSelect").select("10");

    // Wait till table was updated
    cy.wait("@get-flights");
    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("table")
      .get("tbody")
      .children()
      .its("length")
      .should("eq", expectedLength);
    cy.get(".page-item").last().click({ force: true });

    // Wait till table was updated
    cy.wait("@get-flights");
    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("table")
      .get("tbody")
      .children()
      .last()
      .should("include.text", expectedName)
      .and("include.text", "Die Möwen")
      .and("include.text", "Boppard")
      .and("include.text", "Sky Apollo")
      .and("include.text", "10 km")
      .and("include.text", "65 P");
  });
});
