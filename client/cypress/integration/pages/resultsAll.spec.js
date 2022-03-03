import { isInSeason } from "../../support/utils";

describe("check results overall page", () => {
  const year = new Date().getFullYear();

  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit(`${year}/einzelwertung`);
  });

  it("test no filter", () => {
    const expectedLength = isInSeason ? 19 : 18;

    cy.get("table").find("tr").its("length").should("eq", expectedLength);
    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Lois White")
      .and("include.text", "Die Moselfalken")
      .and("include.text", "530 P (97 km)");
  });

  it("test flights of previous year", () => {
    const expectedLength = 1;

    cy.visit(`${year}/einzelwertung`);

    cy.get("#select-season").should("have.value", "2022");
    cy.get("#select-season").select((year - 1).toString());
    cy.url().should("include", `${year - 1}/einzelwertung`);
    cy.get("[data-cy=filter-icon]").should("be.visible");

    cy.get("table").find("tr").its("length").should("eq", expectedLength);
    cy.get("table")
      .find("tr")
      .first()
      .should("include.text", "Leo Altenwerth")
      .and("include.text", "1. Pfälzer DGFC")
      .and("include.text", "Die Möwen")
      .and("include.text", "65 P (10 km)");
  });

  it("test flights of first season", () => {
    const year = 2004;

    cy.visit(`${year}/einzelwertung`);
    cy.get("[data-cy=no-data]").should(
      "contain",
      "Keine Wertung für dieses Jahr vorhanden."
    );
  });
  // TODO: Test more details
});
