describe("check edit flight page", () => {
  const editableFlightId = 6;
  const nonEditableFlightId = 26;

  before(() => {
    cy.seedFlightDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("Check that owner is able to edit flight", () => {
    cy.loginNormalUser();
    cy.visit(`/flug/${editableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").click();
    cy.url().should("include", `/flug/${editableFlightId}/bearbeiten`);
  });

  it("Check that guest isn't able to edit flight", () => {
    cy.login("blackhole+clinton@xccup.net", "PW_ClintonHettinger");
    cy.visit(`/flug/${editableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").should("not.exist");
    cy.get("#admin-options-dropdown").should("not.exist");
  });

  it("Check that flight edit is only possible within 14 days", () => {
    cy.loginNormalUser();
    cy.visit(`/flug/42`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").should("not.exist");
  });

  it("check edit flight details", () => {
    cy.loginNormalUser();
    cy.visit(`/flug/${editableFlightId}`);

    cy.get("#flight-details");

    // Check that admin functionalities are not visible
    cy.get("#admin-options-dropdown").should("not.exist");

    cy.get("button").contains("Flug bearbeiten").click();

    const oldGliderId = "cd25b974-1e30-4969-ba46-34990461990d";
    const newGliderId = "8f48aa72-6ea0-477e-ae3c-e76fa99e7fb5";

    const oldFlightReport = "eius ullam omnis nesciunt amet dolorem";
    const newFlightReport = "Foo";

    const oldAirspaceComment = "";
    const newAirspaceComment = "Upsi voll rein geknattert.";

    cy.get("[data-cy=airspace-comment-textarea]", {
      timeout: 10000,
    })
      .should("have.text", oldAirspaceComment)
      .clear()
      .type(newAirspaceComment);

    cy.get("#glider-select").should("have.value", oldGliderId);
    cy.get("#glider-select")
      .select(newGliderId)
      .should("have.value", newGliderId);

    cy.textareaIncludes("[data-cy=text-editor-textarea]", oldFlightReport);
    cy.get("[data-cy=text-editor-textarea]")
      .clear()
      .type(newFlightReport)
      .should("have.value", newFlightReport);

    cy.get("#hikeAndFlyCheckbox").should("not.be.checked").check();
    cy.get("#logbookCheckbox").should("not.be.checked").check();

    cy.get("[data-cy=save-flight-edit]").contains("Speichern").click();
    cy.url().should("include", `/flug/${editableFlightId}`);

    cy.get("#cyFlightDetailsTable1").contains("td", "U-Turn Bodyguard");
    cy.get("#cyFlightDetailsTable1").contains("td", "270m Höhenunterschied");

    cy.get("#flightDetailsButton").contains("Details anzeigen").click();
    cy.get("#moreFlightDetailsTable").contains("td", "Flugbuch");

    cy.get("[data-cy=flight-report]")
      .find("p")
      .should("have.text", newFlightReport);

    cy.get("[data-cy=airspace-comment]")
      .find("p")
      .should("have.text", newAirspaceComment);
  });

  it("Check that admin is always able to edit flight", () => {
    cy.loginAdminUser();
    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.get("#flight-details");

    cy.get("#admin-options-dropdown").click();

    // Check that the rerun button is also visible
    cy.get("[data-cy=admin-flight-options]")
      .find("li")
      .contains("Neuberechnen");

    cy.get("[data-cy=admin-flight-options]")
      .find("li")
      .contains("Flug bearbeiten")
      .click();
    cy.url().should("include", `/flug/${nonEditableFlightId}/bearbeiten`);
  });

  it("Check that admin is able to delete flight", () => {
    cy.loginAdminUser();
    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.get("#flight-details");
    cy.get("#admin-options-dropdown").click();
    cy.get("[data-cy=admin-flight-options]")
      .find("li")
      .contains("Flug bearbeiten")
      .click();
    cy.url().should("include", `/flug/${nonEditableFlightId}/bearbeiten`);

    cy.get("#cyFlightDeleteButton").click();
    cy.get("#deleteFlightModal").should("be.visible");
    cy.get("button").contains("Löschen").click();

    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.url().should("include", `/404/`);
  });

  it("Check that admin is able to claim airspace violation", () => {
    const flightId = 7;
    // There is only 1 flight from Sevelen Schlepp in all of the test flights
    const expectedTakeoff = "Sevelen Schlepp";

    cy.loginAdminUser();

    // Check that flight is visible
    cy.visit(`${new Date().getFullYear()}/fluege/`);
    cy.get("table").find("tr").should("include.text", expectedTakeoff);

    // Claim airspace violation
    cy.visit(`/flug/${flightId}`);
    cy.get("#flight-details");
    cy.get("#admin-options-dropdown").click();
    cy.get("[data-cy=admin-flight-options]")
      .find("li")
      .contains("LVR reklamieren")
      .click();

    // Flight shouldn't be visible anymore
    cy.visit(`${new Date().getFullYear()}/fluege/`);
    cy.get("table").find("tr").should("not.include.text", expectedTakeoff);
  });
});
