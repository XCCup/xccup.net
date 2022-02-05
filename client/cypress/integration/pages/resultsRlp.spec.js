describe("check results overall page", () => {
  const year = new Date().getFullYear();

  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit(`${year}/rlp-pokal`);
  });

  it("test only citizens of rlp are listed", () => {
    const expectedLength = 2;

    cy.get("table").find("tr").its("length").should("eq", expectedLength);

    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Bobby Volkman")
      .and("include.text", "Die Moselfalken")
      .and("include.text", "Die Elstern")
      .and("include.text", "289")
      .and("include.text", "121");

    cy.get("table")
      .find("tr")
      .last()
      .should("include.text", "Leo Altenwerth")
      .and("include.text", "1. Pfälzer DGFC")
      .and("include.text", "Die Möwen")
      .and("include.text", "153");
  });

  it("test that a flight started not in rlp is not listed", () => {
    /**
     * The rlp ranking should only consider flights of rlp citizens which are also started in rlp.
     * The flight with the externaId 17 (84 Points) belongs also Leo Altenwerth, but was started in BW.
     * Therefore this flight should not be shown.
     */
    cy.get("table")
      .contains("td", "Leo Altenwerth")
      .parent()
      .should("not.include.text", "84");
  });
});
