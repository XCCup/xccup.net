describe("check admin page", () => {
  before(() => {
    cy.seedDb();
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
    cy.get("h1").should("have.text", `XCCup ${new Date().getFullYear()}`);
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
        .eq(9)
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

    cy.get("#flexSwitchCheckChecked").check();

    cy.get("button").contains("Flug absenden").click();

    // Expect to be redirected to flight view after submitting
    cy.url({ timeout: 10000 }).should("include", "/flug");

    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedPilotName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);
  });
});
