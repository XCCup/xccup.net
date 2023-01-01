import { getCurrentYear } from "../../support/utils";

describe("check admin page", () => {
  before(() => {
    cy.seedDb();
    // This pretends that we are currently within an active season on server side
    cy.setBackendTime(`${getCurrentYear()}-06-01T06:00:00`);
  });

  after(() => {
    cy.resetBackendTime();
  });

  beforeEach(() => {
    cy.visit("/");
    cy.loginAdminUser();
    cy.visit("/admin");
  });

  it("test accessing as non admin user", () => {
    cy.logout();
    cy.login("blackhole+clinton@xccup.net", "PW_ClintonHettinger");
    cy.get("#userNavDropdownMenu").should("have.text", "Clinton 3");
    cy.visit("/admin");

    // Non admins should be redirected to the landing page
    cy.url().should("not.contain", "/admin");
    cy.get("h1").should("have.text", `XCCup ${getCurrentYear()}`);
  });

  it("test general page loading", () => {
    cy.get("[data-cy=admin-headline]").should("have.text", "Admin Dashboard");
  });

  it("test loaded unchecked flights", () => {
    cy.get("#adminFlightsPanel")
      .find("table")
      .find("tr")
      .its("length")
      .should("eq", 2);
  });

  it("test accept flight", () => {
    const userOfFlightToAccept = "Olive Emmerich";

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", userOfFlightToAccept)
        .parent()
        .find("td")
        .eq(6)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#acceptFlightModal", "Akzeptieren");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", userOfFlightToAccept)
      .should("not.exist");
  });

  it("test delete flight", () => {
    const userOfFlightToAccept = "Lois White";

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", userOfFlightToAccept)
        .parent()
        .find("td")
        .eq(7)
        .find("button")
        .click();
    });

    cy.typeTextareaInModal(
      "#deleteFlightModal",
      "Du warst 42 m innerhalb der CTR."
    );
    cy.clickButtonInModal("#deleteFlightModal", "Löschen");

    cy.get("#adminFlightsPanel")
      .find("table")
      .contains("td", userOfFlightToAccept)
      .should("not.exist");
  });

  it("test delete proposed flying site", () => {
    const expectedName = "Nur ein Vorschlag";

    cy.get("#nav-sites-tab").click();
    cy.get("#adminSitesPanel").within(() => {
      cy.get("table")
        .contains("td", expectedName)
        .parent()
        .find("td")
        .eq(10)
        .find("button")
        .click();
    });

    cy.clickButtonInModal("#modalSiteConfirm", "Löschen");

    // Table will only be shown if there is at least one entry
    cy.get("#adminSitesPanel").find("table").should("not.exist");
  });

  it("test loaded news flights", () => {
    cy.get("#adminNewsPanel")
      .find("table")
      .find("tr")
      .its("length")
      .should("eq", 3);
  });

  it("test cache control", () => {
    cy.get("#nav-cache-tab").click();

    cy.get("#adminCachePanel")
      .find("button")
      .contains("Statistik anfordern")
      .click();

    cy.get("#adminCachePanel")
      .get("p")
      .should("include.text", "Generelle Daten");
    cy.get("#adminCachePanel")
      .get("li")
      .should("include.text", "hits")
      .and("include.text", "misses")
      .and("include.text", "keys")
      .and("include.text", "ksize")
      .and("include.text", "vsize");

    cy.get("#adminCachePanel")
      .get("p")
      .should("include.text", "Vorhandene Keys");
  });

  it("test tshirt list", () => {
    cy.get("#nav-tshirt-tab").click();

    cy.get("#adminTShirtPanel")
      .find("button")
      .contains("Statistik anfordern")
      .click();

    cy.get("#adminTShirtPanel")
      .get("[data-cy=tshirt-overall-count]")
      .should(
        "include.text",
        "Zur Zeit haben sich 10 Piloten für ein T-Shirt qualifiziert. Dies teilt sich wie folgt auf."
      );
  });

  it("test tshirt list after user opt-out", () => {
    // Go to profile and opt out
    cy.visit("/profil");
    cy.get("#optOutTshirt").check();
    cy.get("button").contains("Speichern").click();

    // Return to admin dashboard
    cy.visit("/admin");
    cy.get("#nav-tshirt-tab").click();

    cy.get("#adminTShirtPanel")
      .find("button")
      .contains("Statistik anfordern")
      .click();

    cy.get("#adminTShirtPanel")
      .get("[data-cy=tshirt-overall-count]")
      .should(
        "include.text",
        "Zur Zeit haben sich 9 Piloten für ein T-Shirt qualifiziert. Dies teilt sich wie folgt auf."
      );
  });

  it("test add new sponsor", () => {
    const expectedName = "Ein Sponsor";
    const expectedWebsite = "www.bester-sponsor.de";
    const expectedTagline = "Der beste Sponsor";

    cy.intercept("GET", "/api/sponsors").as("get-sponsors");

    cy.get("#nav-sponsors-tab").click();

    cy.get("#adminSponsorPanel")
      .find("button")
      .contains("Neuer Sponsor")
      .click();

    // Wait till modal was fully loaded
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get("[data-cy=inputSponsorName").type(expectedName);
    cy.get("[data-cy=inputSponsorWebsite").type(expectedWebsite);
    cy.get("[data-cy=inputSponsorTagline").type(expectedTagline);
    cy.get("[data-cy=checkSponsorCurrentSeason").check();
    cy.get("[data-cy=checkSponsorGold").check();
    cy.get("Button").filter(":visible").contains("Speichern").click();
    // Wait till modal is gone…
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.wait("@get-sponsors");
    cy.get("[data-cy=currentSponsorTable").find("td").contains(expectedName);
    cy.get("[data-cy=currentSponsorTable").find("td").contains(expectedWebsite);
    cy.get("[data-cy=currentSponsorTable").find("td").contains(expectedTagline);
  });

  it("test admin flight upload list", () => {
    const expectedPilotName = "Adam Bayer";
    const igcFileName = "73320_LA9ChMu1.igc";
    const expectedTakeoff = "Laubenheim";
    const expectedAirtime = "1:23h";

    cy.get("#nav-flight-upload-tab").click();

    // Check that button is disabled
    cy.get("button").contains("Flug absenden").should("be.disabled");

    cy.get("#select-pilot").type(expectedPilotName);

    // Check that button is still disabled
    cy.get("button").contains("Flug absenden").should("be.disabled");

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    cy.get("button").contains("Flug absenden").click();

    // Expect to be redirected to flight view after submitting
    cy.url({ timeout: 10000 }).should("include", "/flug");

    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedPilotName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);
  });

  it("test admin flight upload of manipulated igc file", () => {
    const expectedPilotName = "Adam Bayer";
    const igcFileName = "removed_line_20to22.igc";
    const expectedTakeoff = "Zeltingen-Rachtig O";
    const expectedAirtime = "3:53h";

    cy.get("#nav-flight-upload-tab").click();

    // Check that button is disabled
    cy.get("button").contains("Flug absenden").should("be.disabled");

    cy.get("#select-pilot").type(expectedPilotName);

    // Check that button is still disabled
    cy.get("button").contains("Flug absenden").should("be.disabled");

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    cy.get("button").contains("Flug absenden").click();

    cy.get("#upload-error").contains(
      "Dieser Flug resultiert gem. FAI in einem negativen G-Check (http://vali.fai-civl.org/validation.html)."
    );

    cy.get("#flexSwitchGCheck").check();

    cy.get("button").contains("Flug absenden").click();

    // Expect to be redirected to flight view after submitting
    cy.url({ timeout: 10000 }).should("include", "/flug");

    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedPilotName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);
  });

  it("check that after season a new season can be created", () => {
    cy.clock(new Date(Date.parse(getCurrentYear() + "-12-01")).getTime());

    cy.get("#nav-season-tab").click();

    cy.get('[data-cy="remarksParagraph"]').should(
      "include.text",
      "Saison ist abgeschlossen"
    );
    cy.get('[data-cy="seasonStartDataPicker"]')
      .find("input")
      .should("not.be.disabled");
    cy.get('[data-cy="seasonEndDataPicker"]')
      .find("input")
      .should("not.be.disabled");

    // date picker have old values therefore the save button should be disabled
    cy.get('[data-cy="submitSeasonButton"]').should("be.disabled");
  });

  it("check that ongoing season is not modifiable", () => {
    cy.clock(new Date(Date.parse(getCurrentYear() + "-06-01")).getTime());

    cy.get("#nav-season-tab").click();

    cy.get('[data-cy="remarksParagraph"]').should(
      "include.text",
      "Saison ist aktiv"
    );
    cy.get('[data-cy="seasonStartDataPicker"]')
      .find("input")
      .should("be.disabled");
    cy.get('[data-cy="seasonEndDataPicker"]')
      .find("input")
      .should("be.disabled");
  });

  it("pause current season and upload flight", () => {
    cy.clock(new Date(Date.parse(getCurrentYear() + "-06-01")).getTime());

    const fileName = "68090_K3EThSc1.igc";
    const expectedTakeoff = "Niederzissen/Bausenberg";
    const expectedFlightStatus = "Flugbuch";

    cy.get("#nav-season-tab").click();

    cy.get('[data-cy="saisonPauseCheckbox"]').check();
    cy.get("button").contains("Saison updaten").click();

    // Upload flight
    cy.visit("/upload");

    // Wait till page was fully loaded
    cy.get('input[type="file"]#igcUploadForm').should("be.visible");

    cy.fixture(fileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 4000,
    }).should("have.value", expectedTakeoff);

    cy.get("#acceptTermsCheckbox").check();

    cy.get("Button").contains("Streckenmeldung absenden").click();

    // Wait till redirection has happened
    cy.get("[data-cy=flight-details-pilot]", {
      timeout: 10000,
    });

    // Check for flight status
    cy.get("#flightDetailsButton").click();
    cy.get("#moreFlightDetailsTable").should(
      "include.text",
      expectedFlightStatus
    );
  });
});
