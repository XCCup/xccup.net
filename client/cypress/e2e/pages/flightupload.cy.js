import axios from "axios";

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
    cy.intercept("POST", "photos*").as("post-photo");

    const igcFileName = "73320_LA9ChMu1.igc";
    const flightReport = "This is a flight report.";
    const photoCaption = `Super tolles "Bild" 🚀 <a href=""'>foo</a>`;
    const photoCaptionExpected = `Super tolles "Bild" 🚀 foo`;
    const expectedMaxPhotosMessage = "Du kannst maximal neun Photos hochladen";

    const airspaceComment = "Alles offen, kein Problem 🤪";

    const photo1 = "bremm.jpg";
    const photo2 = "rachtig.jpg";

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

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 40000,
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

    cy.get("#photo-0", {
      timeout: 10000,
    })
      .should("exist")
      .find("img")
      .should("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
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

    cy.get("#photo-1", {
      timeout: 10000,
    }).should("exist");
    cy.get("#add-photo", {
      timeout: 10000,
    }).should("exist");

    // Upload 7 more
    for (let i = 0; i < 7; i++) {
      cy.fixture(photo2)
        .then(Cypress.Blob.base64StringToBlob)
        .then((fileContent) => {
          cy.get('input[type="file"]#photo-input').attachFile({
            fileContent,
            fileName: photo2,
            mimeType: "image/jpg",
          });
        });
    }

    cy.get("#add-photo", {
      timeout: 10000,
    }).should("not.exist");

    cy.get("[data-cy=error-message]").should("not.exist");

    //  Try one more time (should fail)
    cy.fixture(photo2)
      .then(Cypress.Blob.base64StringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]#photo-input').attachFile({
          fileContent,
          fileName: photo2,
          mimeType: "image/jpg",
        });
      });
    cy.get("[data-cy=error-message]").contains(expectedMaxPhotosMessage);

    // Add data to different inputs

    cy.get("[data-cy=airspace-comment-checkbox]").should("not.be.checked");
    cy.get("#airspace-collapse").should("not.have.class", "show");

    cy.get("[data-cy=airspace-comment-checkbox]").click();
    cy.get("#airspace-collapse").should("have.class", "show");
    cy.get("[data-cy=airspace-comment-textarea]").type(airspaceComment);

    cy.get("[data-cy=text-editor-textarea]").type(flightReport);
    cy.get("[data-cy=photo-caption-0]").type(photoCaption);

    cy.get("#hikeAndFlyCheckbox").click();
    cy.get("#logbookCheckbox").click();

    cy.get("#acceptTermsCheckbox").uncheck();
    cy.get("Button").contains("Streckenmeldung absenden").should("be.disabled");
    cy.get("#acceptTermsCheckbox").check();

    // Wait till all photos are uploaded (9)
    for (let i = 1; i <= 9; i++) {
      cy.wait("@post-photo");
    }

    cy.intercept("PUT", "/api/flights/*").as("update-flight");
    cy.intercept("GET", "/api/flights/*").as("get-flight");

    // Finish flight submission
    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.wait("@update-flight");
    cy.wait("@get-flight");

    // Expect to be redirected to flight view after submitting
    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedUserName);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
    cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);

    cy.get("[data-cy=airspace-comment]")
      .find("p")
      .should("have.text", airspaceComment);
    cy.get("[data-cy=flight-report]")
      .find("p")
      .should("have.text", flightReport);

    cy.get("[data-cy=METAR-Stats]").should("not.exist");
    cy.get("#metarButton").should("not.exist");

    cy.get("#photo-0")
      .find("img")
      .should("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.equal(310);
      });

    cy.get("[data-cy=photo-caption-0]").should(
      "have.text",
      photoCaptionExpected
    );
    cy.get("#photo-0").click();

    cy.get("#glightbox-slider").within(() => {
      cy.get(".gslide-image")
        .find("img")
        .and(($img) => {
          expect($img[0].naturalWidth).to.equal(4000);
        });
    });
  });

  it("test upload new personal best and check METAR", () => {
    const igcFileName = "104km.igc";

    const expectedTakeoff = "Hoher Meissner Uengsterode";
    const expectedUserName = "Ramona Gislason";
    const expectedAwardText = "Neue Persönliche Bestleistung";
    const expectedMailReceipient = "blackhole+ramona@xccup.net";
    const expectedMailContent =
      "Herzlichen Glückwunsch zur neuen persönlichen Bestleistung";

    const expectedFirstMetar =
      "METAR EDVK 221050Z 35006KT 320V030 9999 SCT041 17/08 Q1016";
    const expectedLastMetar =
      "METAR EDVK 221550Z VRB03KT 9999 FEW048 20/08 Q1014";

    // Test another file to NOT be the personal best
    const igcFileName2 = "fai_60km42_3h53m.igc";
    const expectedTakeoff2 = "Zeltingen-Rachtig";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 40000,
    }).should("have.value", expectedTakeoff);

    cy.get("#acceptTermsCheckbox").check();

    cy.intercept("PUT", "/api/flights/*").as("update-flight");
    cy.intercept("GET", "/api/flights/*").as("get-flight");

    // Finish flight submission
    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.wait("@update-flight");
    cy.wait("@get-flight");

    cy.get("[data-cy=METAR-Stats]").contains("Wetter (Beta)");
    cy.get("#metarButton").click();
    cy.get("#metarDetailsCollapse > :nth-child(1)").contains(
      expectedFirstMetar
    );
    cy.get("#metarDetailsCollapse > :nth-child(19)").contains(
      expectedLastMetar
    );

    // Expect to be redirected to flight view after submitting
    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedUserName);

    cy.get("[data-cy=personal-best-tag]")
      .should("exist")
      .contains(expectedAwardText);

    cy.wrap(null).then(async () => {
      // Check that admin received an email
      cy.recipientReceivedEmailWithText(
        expectedMailReceipient,
        expectedMailContent
      );
    });

    // Second flight that now should not be a personal best
    cy.visit("/");
    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName2).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 40000,
    }).should("have.value", expectedTakeoff2);

    cy.get("#acceptTermsCheckbox").check();

    cy.intercept("PUT", "/api/flights/*").as("update-flight");
    cy.intercept("GET", "/api/flights/*").as("get-flight");

    // Finish flight submission
    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.wait("@update-flight");
    cy.wait("@get-flight");

    // Expect to be redirected to flight view after submitting
    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedUserName);

    cy.get("[data-cy=personal-best-tag]").should("not.exist");
  });

  it("test upload flight twice", () => {
    const igcFileName = "74931_2022-06-18_14.11_Kluesserath.igc";
    const expectedError =
      "Dieser Flug ist bereits vorhanden. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an info@xccup.net";
    const expectedLanding = "Klüsserath";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 40000,
    }).should("have.value", expectedLanding);

    cy.get("#acceptTermsCheckbox").check();

    cy.get("Button").contains("Streckenmeldung absenden").click();

    // Wait till redirection has happened
    cy.get("[data-cy=flight-details-pilot]", {
      timeout: 10000,
    });

    // Add same flight again
    cy.get("button").contains("Flug hochladen").click();

    // Try to upload the same flight a second time
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

  it("test upload flight with airspace violation and accept it", () => {
    const igcFileName = "47188_J3USaNi1.igc";
    const airspaceComment = "CTR Büchel inaktiv";
    const expectedError = "Dieser Flug enthält eine Luftraumverletzung";
    const expectedUserName = "Ramona Gislason";
    const expectedFlightState = "In Prüfung";

    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.fixture(igcFileName).then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: igcFileName,
        mimeType: "text/plain",
      });
    });

    // Increase timeout because calculation takes some time
    cy.get('input[type="text"]', {
      timeout: 40000,
    }).should("have.value", "Serrig");
    cy.get("p.text-danger").should("contain.text", expectedError);

    cy.get("#acceptTermsCheckbox").check();

    // This flight contains a airspace violation. Unless the user has explained this violation the commit button should be disabled.
    cy.get("Button").contains("Streckenmeldung absenden").should("be.disabled");
    cy.get("[data-cy=airspace-comment-textarea]").type(airspaceComment);

    cy.get("Button").contains("Streckenmeldung absenden").click();

    // Finish flight submission
    cy.intercept("PUT", "/api/flights/*").as("update-flight");
    cy.intercept("GET", "/api/flights/*").as("get-flight");
    cy.get("Button").contains("Streckenmeldung absenden").click();

    cy.wait("@update-flight");
    cy.wait("@get-flight");

    // Expect to be redirected to flight view after submitting
    cy.get("[data-cy=flight-details-pilot]")
      .find("a")
      .contains(expectedUserName);

    cy.get("#flightDetailsButton").click();
    cy.get("#moreFlightDetailsTable").should(
      "contain.text",
      expectedFlightState
    );
    // Store URL of current flight view to navigate back to it later
    cy.url().as("flightURL", { type: "static" });

    // Switch to admin and accept violation
    cy.logout();
    cy.loginAdminUser();
    cy.visit("/admin");

    cy.get("#adminFlightsPanel").within(() => {
      cy.get("table")
        .contains("td", expectedUserName)
        .parent()
        .find("td")
        .eq(6)
        .find("button")
        .click();
    });
    cy.clickButtonInModal("#acceptFlightModal", "Akzeptieren");

    // Navigate back to flight and see if the flight state changed (could be "In Wertung" or "Flugbuch")
    cy.get("@flightURL").then((url) => {
      cy.visit(url);
    });
    cy.url().should("include", "/flug");
    cy.get("#moreFlightDetailsTable").should(
      "not.contain.text",
      expectedFlightState
    );
  });

  it("Test upload flight out of xccup area", () => {
    const igcFileName = "out_of_area_2.igc";
    const expectedError =
      "Dieser Flug liegt ausserhalb des XCCup Gebiets. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an info@xccup.net";

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

  it("Test upload by MaxPunkte manipulated valid igc file", () => {
    const igcFileName = "MaxPunkte_manipulated.igc";
    const expectedError = "Diese IGC-File wurde manipuliert.";

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

  it("Test upload with leonardo interface", () => {
    const form = new FormData();

    const igcFileName = "73883_2022-04-19_13.39_Donnersberg__Baeren.igc";
    const expectedTakeoff = "Donnersberg";
    const expectedUserName = "Melinda Tremblay";
    const expectedAirtime = "1:42h";
    const expectedReport = "Das ist ein Upload über die Leonardo Schnittstelle";
    const expectApiResponse =
      "Der Flug wurde mit dem Gerät Flow XC Racer eingereicht. Du findest deinen Flug unter http://localhost:8000/flug/";

    cy.fixture(igcFileName).then(async (fileContent) => {
      form.append("user", "blackhole+melinda@xccup.net");
      form.append("pass", "PW_MelindaTremblay");
      form.append("IGCigcIGC", fileContent.toString());
      form.append("igcfn", igcFileName);
      form.append("report", expectedReport);

      const data = (
        await axios.post("http://localhost:3000/api/flights/leonardo", form)
      ).data;

      // Test the response message from the API
      expect(data).to.include(expectApiResponse);

      const regex = /.*\/flug\/(\d+)./;
      const flightId = data.match(regex)[1];

      // Wait till flight was fully calculated
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      // cy.wait(5000);

      cy.visit(`/flug/${flightId}`);

      cy.get("[data-cy=flight-details-pilot]")
        .find("a")
        .contains(expectedUserName);
      cy.get("#cyFlightDetailsTable2").find("td").contains(expectedTakeoff);
      cy.get("#cyFlightDetailsTable2").find("td").contains(expectedAirtime);
      cy.get("[data-cy=flight-report]")
        .find("p")
        .should("have.text", expectedReport);
    });
  });

  it("Test upload airspace violation with leonardo interface", () => {
    const igcFileName = "airspace_violation_2022.igc";
    const expectedTakeoff = "Kreuzberg";
    const expectState = "In Prüfung";
    const expectApiRespone =
      "Der Flug wurde mit dem Gerät Flow XC Racer eingereicht. Du findest deinen Flug unter http://localhost:8000/flug/";
    const expectApiRespone2 =
      "Dein Flug hatte eine Luftraumverletzung. Bitte ergänze eine Begründung in der Online-Ansicht. Wir prüfen diese so schnell wie möglich.";

    cy.fixture(igcFileName).then({ timeout: 20000 }, async (fileContent) => {
      const payload = {
        user: "blackhole+melinda@xccup.net",
        pass: "PW_MelindaTremblay",
        IGCigcIGC: fileContent.toString(),
        igcfn: igcFileName,
      };
      const data = (
        await axios.post("http://localhost:3000/api/flights/leonardo", payload)
      ).data;

      // Test the response message from the API
      expect(data).to.include(expectApiRespone);
      expect(data).to.include(expectApiRespone2);

      const regex = /.*\/flug\/(\d+)./;
      const flightId = data.match(regex)[1];

      // Wait till flight was fully calculated
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      // cy.wait(5000);
      cy.login(payload.user, payload.pass);

      // Check if flight link is valid
      cy.visit(`/flug/${flightId}`);
      cy.get("#moreFlightDetailsTable").find("td").contains(expectState);

      // Check if flight is listed under "My Flights"
      cy.visit(`/profil/`);
      // Wait till table was loaded (even if no visible) and than click the button
      cy.get("[data-cy=my-flights-table]");
      cy.get("button").contains("Meine Flüge").click();
      cy.get("[data-cy=my-flights-table]").find("td").contains(expectedTakeoff);
    });
  });

  it("Test upload with leonardo interface (wrong content)", () => {
    const igcFileName = "73883_2022-04-19_13.39_Donnersberg__Baeren.igc";
    const expectApiRespone = "Invalid G-Record";
    const expectedStatus = 400;
    const expectedComment = `Hallo Admins!

Es wurde versucht einen Flug mit einem negativen G-Check hochzuladen.

Pilot: Melinda Tremblay

Euer Server-Knecht`;
    const expectedMailReceipient = "me@example.com";

    const payload = {
      user: "blackhole+melinda@xccup.net",
      pass: "PW_MelindaTremblay",
      IGCigcIGC: "just any plain text",
      igcfn: igcFileName,
    };
    cy.wrap(null).then(async () => {
      try {
        await axios.post("http://localhost:3000/api/flights/leonardo", payload);
      } catch (error) {
        // Test the response message from the API
        expect(error.response.status).to.equal(expectedStatus);
        expect(error.response.data).to.include(expectApiRespone);
      }

      // Check that admin received an email
      cy.recipientReceivedEmailWithText(
        expectedMailReceipient,
        expectedComment
      );
    });
  });

  it("Test upload with leonardo interface (wrong credentials)", () => {
    const igcFileName = "73883_2022-04-19_13.39_Donnersberg__Baeren.igc";
    const expectedStatus = 401;

    cy.fixture(igcFileName).then({ timeout: 10000 }, async (fileContent) => {
      const payload = {
        user: "blackhole+melinda@xccup.net",
        pass: "WrongPassword",
        IGCigcIGC: fileContent.toString(),
        igcfn: igcFileName,
      };
      try {
        await axios.post("http://localhost:3000/api/flights/leonardo", payload);
      } catch (error) {
        // Test the response message from the API
        expect(error.response.status).to.equal(expectedStatus);
      }
    });
  });

  it("Test upload by MaxPunkte manipulated valid igc file with leonardo interface", () => {
    const igcFileName = "MaxPunkte_manipulated.igc";
    const expectApiRespone = "Error parsing IGC File Manipulated IGC-File";
    cy.fixture(igcFileName).then({ timeout: 10000 }, async (fileContent) => {
      const payload = {
        user: "blackhole+melinda@xccup.net",
        pass: "PW_MelindaTremblay",
        IGCigcIGC: fileContent.toString(),
        igcfn: igcFileName,
      };
      try {
        await axios.post("http://localhost:3000/api/flights/leonardo", payload);
      } catch (error) {
        expect(error.response.data).to.include(expectApiRespone);
      }
    });
  });

  // // This test works only if the overwrite in FlightController:checkIfFlightIsModifiable is disabled/removed
  // it("Test upload flight to old", () => {
  //   const igcFileName = "73320_LA9ChMu1.igc";
  //   const expectedError =
  //     "Dieser Flug ist älter als 14 Tage. Ein Upload ist nicht mehr möglich. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an info@xccup.net";

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
