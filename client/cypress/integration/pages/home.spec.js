describe("check landing page", () => {
  before(() => {
    cy.seedDb();
    cy.visit("/");
  });

  it("test correct values for infobox", () => {
    cy.get("h1").should("have.text", `XCCup ${new Date().getFullYear()}`);

    cy.get("#infoboxContent").should("include.text", "20 Piloten");
    cy.get("#infoboxContent").should("include.text", "44 Vereine");
    cy.get("#infoboxContent").should("include.text", "4 Teams");
    cy.get("#infoboxContent").should("include.text", "1177 km");
  });

  it("test daily ranking", () => {
    cy.get("#cy-daily-ranking-panel").within(() => {
      //Consider evaluating the date within the h3 (depends on the time; till 12oclock it's the day before to today)
      cy.get("h3").should("include.text", "Tageswertung");

      //TODO: Do more than just check if the component is there
      cy.get(".leaflet-container");

      cy.get("table").find("tr").its("length").should("eq", 5);

      const isAfter12OClock = new Date().getHours() >= 12;
      const firstRow = isAfter12OClock
        ? ["1", "Leo AltenwerthStüppel", "74 km", "212 P"]
        : ["1", "Ms. LaurieBurgen", "12 km", "75 P"];
      const lastRow = isAfter12OClock
        ? ["5", "Camille Schaden", "Königstuhl", "19 km", "55 P"]
        : ["5", "Ramona Gislason", "Schriesheim-Ölberg", "9 km", "53 P"];

      cy.get("table")
        .find("tr")
        .first()
        .should("include.text", firstRow[0])
        .and("include.text", firstRow[1])
        .and("include.text", firstRow[2])
        .and("include.text", firstRow[3]);
      cy.get("table")
        .find("tr")
        .last()
        .should("include.text", lastRow[0])
        .and("include.text", lastRow[1])
        .and("include.text", lastRow[2])
        .and("include.text", lastRow[3]);
    });
  });

  it("test club ranking", () => {
    cy.get("#overallResultsTabPanel").within(() => {
      cy.get(".nav-item").contains("Vereinswertung").click();
    });

    cy.get("#clubRankingTable").find("tr").its("length").should("eq", 3);
    cy.get("#clubRankingTable")
      .find("tr")
      .last()
      .should("have.text", "3Drachenflieger-Club Trier504 P430 km");
  });

  it("test team ranking", () => {
    cy.get("#overallResultsTabPanel").within(() => {
      cy.get(".nav-item").contains("Teamwertung").click();
    });

    cy.get("#teamRankingTable").find("tr").its("length").should("eq", 3);
    cy.get("#teamRankingTable")
      .find("tr")
      .last()
      .should("have.text", "3Die Möwen503 P249 km");
  });

  it("test overall ranking", () => {
    cy.get("#overallResultsTabPanel").within(() => {
      cy.get(".nav-item").contains("Top Flüge").click();
    });

    cy.get("#topFlights").within(() => {
      cy.get("table").find("tr").its("length").should("eq", 5);
      cy.get("table")
        .find("tr")
        .last()
        .should("include.text", "5")
        .and("include.text", "Leo Altenwerth")
        .and("include.text", "Stüppel")
        .and("include.text", "74 km")
        .and("include.text", "212 P");
    });
  });

  it("test sponsors", () => {
    cy.get("#sponsorsPanel").within(() => {
      cy.get("h2").contains("Sponsoren");
    });

    cy.get("#goldSponsors")
      .find(".square-holder")
      .its("length")
      .should("eq", 3);
    cy.get("#otherSponsors")
      .find(".square-holder")
      .its("length")
      .should("eq", 17);
  });
});
