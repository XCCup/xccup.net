import { isInSeason } from "../../support/utils";

describe("check landing page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("test correct values for infobox", () => {
    cy.get("h1").should("have.text", `XCCup ${new Date().getFullYear()}`);

    cy.get("#infoboxContent").should("include.text", "20 Piloten");
    cy.get("#infoboxContent").should("include.text", "36 Vereine");
    cy.get("#infoboxContent").should("include.text", "3 Teams");
    cy.get("#infoboxContent").should("include.text", "1177 km");
  });

  it("test news items", () => {
    cy.get("[data-cy=news-items]").find("h2").should("have.text", "News");

    const expectedInitialButtonLabel = "Mehr anzeigen";
    const expectedSnippedLastWord = "temporib…";
    const expectedLastWord = "voluptas?";

    cy.get("[data-cy=news-item]").should("have.length", 3);
    cy.get("[data-cy=news-item]")
      .first()
      .within(() => {
        cy.get("[data-cy=news-item-icon]").should("have.class", "bi-alarm");
        cy.get("h4").should("have.text", "Ad dolore");
        cy.get("[data-cy=news-item-date]").should("have.text", "01.11.2021");
        cy.get("[data-cy=news-item-text]").should(
          "include.text",
          expectedSnippedLastWord
        );
        cy.get("[data-cy=news-item-text]").should(
          "not.include.text",
          expectedLastWord
        );
        cy.get("[data-cy=news-item-button]")
          .should("have.text", expectedInitialButtonLabel)
          .click()
          .should("have.text", "Weniger anzeigen");
        cy.get("[data-cy=news-item-text]").should(
          "include.text",
          expectedLastWord
        );

        cy.get("[data-cy=news-item-button]")
          .click()
          .should("have.text", expectedInitialButtonLabel);
        cy.get("[data-cy=news-item-text]").should(
          "include.text",
          expectedSnippedLastWord
        );
      });

    cy.get("[data-cy=news-item]")
      .last()
      .within(() => {
        cy.get("[data-cy=news-item-icon]").should(
          "have.class",
          "bi-exclamation-octagon"
        );
        cy.get("h4").should("have.text", "Tenetur quod quidem");
        cy.get("[data-cy=news-item-date]").should("have.text", "01.02.2021");
        cy.get("[data-cy=news-item-text]").should(
          "include.text",
          "pariatur at!"
        );
      });
  });

  it("test daily ranking", () => {
    cy.get("#cy-daily-ranking-panel").within(() => {
      //Consider evaluating the date within the h3 (depends on the time; till XX oclock it's the day before to today)
      cy.get("h3").should("include.text", "Tageswertung");

      //TODO: Do more than just check if the component is there
      cy.get(".leaflet-container");

      cy.get("table").find("tr").its("length").should("gte", 5);

      const isNextDailyRanking = new Date().getHours() >= 15;
      const anyRow1 = isNextDailyRanking
        ? ["Leo Altenwerth", "Stüppel", "74 km", "212 P"]
        : ["Ms. Laurie", "Burgen", "12 km", "75 P"];
      const anyRow2 = isNextDailyRanking
        ? ["Camille Schaden", "Königstuhl", "19 km", "55 P"]
        : ["Ramona Gislason", "Schriesheim-Ölberg", "9 km", "53 P"];

      cy.get("table")
        .find("td")
        .contains(anyRow1[0])
        .parent()
        .and("include.text", anyRow1[1])
        .and("include.text", anyRow1[2])
        .and("include.text", anyRow1[3]);
      cy.get("table")
        .find("td")
        .contains(anyRow2[0])
        .parent()
        .and("include.text", anyRow2[1])
        .and("include.text", anyRow2[2])
        .and("include.text", anyRow2[3]);
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
      .should("have.text", "3Drachenflieger-Club Trier420 P147 km");
  });

  it("test team ranking", () => {
    //Due to the modifaction on the "daily flights" this value will change
    const expectedValue = isInSeason()
      ? "3Die Adler739 P199 km"
      : "3Die Möwen587 P179 km";

    cy.get("#overallResultsTabPanel").within(() => {
      cy.get(".nav-item").contains("Teamwertung").click();
    });

    cy.get("#teamRankingTable").find("tr").its("length").should("eq", 3);
    cy.get("#teamRankingTable")
      .find("tr")
      .last()
      .should("have.text", expectedValue);
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

    cy.get("#goldSponsors").find(".cy-sponsor").its("length").should("eq", 3);
    cy.get("#otherSponsors").find(".cy-sponsor").its("length").should("eq", 17);
  });
});
