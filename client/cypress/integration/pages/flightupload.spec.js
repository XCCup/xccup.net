describe("check admin page", () => {
  before(() => {
    cy.visit("/");
    cy.get("button").contains("Flug hochladen").click();
  });

  it("test upload only possible for logged-in user", () => {
    cy.get("button").contains("Flug hochladen").click();

    cy.location("pathname").should("eq", "/login");
  });

  // TODO: Implement testcase
  //   it("test upload of flight outside of xccup region is not allowed", () => {
  //     cy.get("button").contains("Flug hochladen").click();
  //   });

  it("test upload flight", () => {
    const igcFileName = "73320_LA9ChMu1.igc";
    const reportText = "This is a flight report.";
    const expectedTakeoff = "Laubenheim";
    const expectedUserName = "Ramona Gislason";
    const expectedAirtime = "1:23h";
    // const expectedLanding = "API Disabled";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.get("h3").should("have.text", `Flug hochladen`);

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calclation takes some time
    cy.get('input[type="text"]', {
      timeout: 10000,
    }).should("have.value", expectedTakeoff);

    // After igc upload these fields should be enabled
    cy.get(".cy-flight-report").type(reportText);
    cy.get("#hikeAndFlyCheckbox").click();
    cy.get("#logbookCheckbox").click();

    cy.get("#acceptTermsCheckbox").uncheck();
    cy.get("Button").contains("Streckenmeldung absenden").should("be.disabled");
    cy.get("#acceptTermsCheckbox").check();

    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.get("#cyFlightDetailsTable1").find("td").contains(expectedUserName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);
  });
});
