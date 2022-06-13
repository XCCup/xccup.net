import { isAfter } from "date-fns";
import { isInSeason } from "../../support/utils";

describe("check results overall page", () => {
  const year = new Date().getFullYear();

  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit(`${year}/earlybird`);
  });

  it("test first flight is listed not most points", () => {
    /**
     * It's missing two entries for Olive Emmerich and Everett Gislason because their flights are from july and we only consider the first three months of the season.
     */
    const expectedLength = isInSeason() ? 17 : 16;

    cy.get("table").find("tr").its("length").should("eq", expectedLength);

    // Check that the first flight of Bobby Volkman and not his second flight with more points is listed
    // Due to regular changes on the "daily flights" the result table will not match in the beginning of march after start of season
    if (isAfter(new Date(), new Date(`${new Date().getFullYear()}-03-09`))) {
      cy.get("table")
        .find("tr")
        .first()
        .should("include.text", "Bobby Volkman")
        .and("include.text", "Donnersberg")
        .and("include.text", "Die Moselfalken")
        .and("include.text", "121 P")
        .and("include.text", "22 km");
    }
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
