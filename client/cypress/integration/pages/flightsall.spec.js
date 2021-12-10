describe("check flights all page", () => {
  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit("/fluege");
  });

  it("test no filter no sorting", () => {
    const expectedLength = 43;

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

  it("test filter on pilot name", () => {
    const expectedName = "Bobby Volkman";
    const expectedLength = 2;

    cy.get("#filterButton").click();

    cy.get("#filterSelectName").select(expectedName);
    cy.get("button").contains("Anwenden").click();

    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    cy.wait(1000);
    /*eslint-enable */
    cy.get("table").find("tr").its("length").should("eq", expectedLength);

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
    const expectedLength = 43;

    cy.get("th").contains("Punkte").dblclick();
    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    cy.wait(1000);
    /*eslint-enable */
    cy.get("table").find("tr").its("length").should("eq", expectedLength);

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
    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    cy.wait(1000);
    /*eslint-enable */
    cy.get("table").find("tr").its("length").should("eq", expectedLength);
    cy.get(".page-item").last().click();
    /*eslint-disable */
    // TODO: Find better solution
    // Wait till table is updated otherwise its() will always resolve to 25
    cy.wait(1000);
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
