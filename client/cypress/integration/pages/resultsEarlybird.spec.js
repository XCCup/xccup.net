describe("check results overall page", () => {
  const year = new Date().getFullYear();

  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit(`${year}/earlybird`);
  });

  it("test first flight is listed not most points", () => {
    // It's missing one entry for Olive Emmerich because his flight is from july and we count only flights within the first three months of the season
    const expectedLength = 17;

    cy.get("table").find("tr").its("length").should("eq", expectedLength);

    // Check that the first flight of Bobby Volkman and not his second flight with more points is listed
    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Bobby Volkman")
      .and("include.text", "Donnersberg")
      .and("include.text", "Die Moselfalken")
      .and("include.text", "Donnersberg")
      .and("include.text", "121 P")
      .and("include.text", "22 km");
  });

  it('test that only flights "in ranking" are listed', () => {
    // Check that the first flight of Tamara Ledner is not listed because it exceeds not the point threshold
    cy.get("table")
      .contains("td", "Tamara Ledner")
      .parent()
      .should("not.include.text", "Burgen")
      .should("not.include.text", "55 P")
      .should("not.include.text", "10 km");
  });
});
