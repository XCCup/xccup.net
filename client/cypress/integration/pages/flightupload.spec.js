describe("check flight upload page", () => {
  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("test upload only possible for logged-in user", () => {
    cy.get("button").contains("Flug hochladen").click();

    cy.location("pathname").should("eq", "/login");
  });

  it("test upload flight", () => {
    const igcFileName = "73320_LA9ChMu1.igc";
    const flightReport = "This is a flight report.";
    const airspaceComment = "Alles offen, kein Problem 🤪";

    const photo1 = "rachtig.jpg";
    const photo2 = "bremm.jpg";

    const expectedTakeoff = "Laubenheim";
    const expectedUserName = "Ramona Gislason";
    const expectedAirtime = "1:23h";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calclation takes some time
    cy.get('input[type="text"]', {
      timeout: 20000,
    }).should("have.value", expectedTakeoff);

    // Add photos
    cy.fixture(photo1)
      .then(Cypress.Blob.base64StringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]#photo-input').attachFile({
          fileContent,
          fileName: photo1,
          mimeType: "image/jpg",
        });
      });
    cy.fixture(photo2)
      .then(Cypress.Blob.base64StringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]#photo-input').attachFile({
          fileContent,
          fileName: photo2,
          mimeType: "image/jpg",
        });
      });

    cy.get("#photo-0", {
      timeout: 10000,
    }).should("exist");
    cy.get("#photo-1", {
      timeout: 10000,
    }).should("exist");
    cy.get("#add-photo", {
      timeout: 10000,
    }).should("exist");

    // Add data to differnt inputs

    cy.get("[data-cy=airspace-comment-checkbox]").should("not.be.checked");
    cy.get("#airspace-collapse").should("not.have.class", "show");

    cy.get("[data-cy=airspace-comment-checkbox]").click();
    cy.get("#airspace-collapse").should("have.class", "show");
    cy.get("[data-cy=airspace-comment-textarea]").type(airspaceComment);

    cy.get(".cy-flight-report").type(flightReport);
    cy.get("#hikeAndFlyCheckbox").click();
    cy.get("#logbookCheckbox").click();

    cy.get("#acceptTermsCheckbox").uncheck();
    cy.get("Button").contains("Streckenmeldung absenden").should("be.disabled");
    cy.get("#acceptTermsCheckbox").check();

    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.get("#cyFlightDetailsTable1").find("td").contains(expectedUserName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);

    cy.get("[data-cy=airspace-comment]")
      .find("p")
      .should("have.text", airspaceComment);
    cy.get("[data-cy=flight-report]")
      .find("p")
      .should("have.text", flightReport);
  });

  it("test upload flight twice", () => {
    const igcFileName = "47188_J3USaNi1.igc";
    const expectedError =
      "Dieser Flug ist bereits vorhanden. Wenn du denkst dass dies ein Fehler ist wende dich bitte an next@xccup.net";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calclation takes some time
    cy.get('input[type="text"]', {
      timeout: 20000,
    }).should("have.value", "Serrig");

    cy.get("#acceptTermsCheckbox").check();

    cy.get("Button").contains("Streckenmeldung absenden").click();

    // TODO: This wait is far from perfect. We can't be sure that that the calculation has really finished. Problem: How to do an retry on cy.visit or cy.request?
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    // Add same flight again
    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because processing takes some time
    cy.get("#upload-error", {
      timeout: 10000,
    }).should("have.text", expectedError);
  });

  it("Test upload flight out of xccup area", () => {
    const igcFileName = "out_of_area_2.igc";
    const expectedError =
      "Dieser Flug liegt ausserhalb des XCCup Gebiets. Wenn du denkst dass dies ein Fehler ist wende dich bitte an next@xccup.net";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because processing takes some time
    cy.get("#upload-error", {
      timeout: 10000,
    }).should("have.text", expectedError);
  });

  it("Test upload invalid igc file (FAI error response)", () => {
    const igcFileName = "invalid.igc";
    const expectedError =
      "Dieser Flug resultiert gem. FAI in einem negativen G-Check";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because processing takes some time
    cy.get("#upload-error", {
      timeout: 10000,
    }).should("include.text", expectedError);
  });

  it("Test upload manipulated igc file (FAI failed response)", () => {
    const igcFileName = "removed_line_20to22.igc";
    const expectedError =
      "Dieser Flug resultiert gem. FAI in einem negativen G-Check";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because processing takes some time
    cy.get("#upload-error", {
      timeout: 10000,
    }).should("include.text", expectedError);
  });

  // // This test works only if the overwrite in FlightController:checkIfFlightIsModifiable is disabled/removed
  // it("Test upload flight to old", () => {
  //   const igcFileName = "73320_LA9ChMu1.igc";
  //   const expectedError =
  //     "Dieser Flug ist älter als 14 Tage. Ein Upload ist nicht mehr möglich. Wenn du denkst dass dies ein Fehler ist wende dich bitte an next@xccup.net";

  //   cy.loginNormalUser();

  //   cy.get("button").contains("Flug hochladen").click();

  //   cy.fixture(igcFileName).then((fileContent) => {
  //     cy.get('input[type="file"]#igcUploadForm').attachFile({
  //       fileContent: fileContent.toString(),
  //       fileName: igcFileName,
  //       mimeType: "text/plain",
  //     });
  //   });

  //   // Increase timeout because processing takes some time
  //   cy.get("#upload-error", {
  //     timeout: 10000,
  //   }).should("have.text", expectedError);
  // });
});
