describe("check flight page", () => {
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
    cy.login("Clinton@Hettinger.name", "PW_ClintonHettinger");
    cy.visit(`/flug/${editableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").should("not.exist");
  });

  it("Check that flight edit is only possible within 14 days", () => {
    cy.loginNormalUser();
    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").should("not.exist");
  });

  it("check edit flight details", () => {
    cy.loginNormalUser();
    cy.visit(`/flug/${editableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").click();

    const oldGliderId = "cd25b974-1e30-4969-ba46-34990461990d";
    const newGliderId = "8f48aa72-6ea0-477e-ae3c-e76fa99e7fb5";

    const oldFlightReport = "eius ullam omnis nesciunt amet dolorem";
    const newFlightReport = "Foo";

    const oldAirspaceComment = "";
    const newAirspaceComment = "Upsi voll rein geknattert.";

    cy.get("[data-cy=airspace-comment-textarea]")
      .should("have.text", oldAirspaceComment)
      .clear()
      .type(newAirspaceComment);

    cy.get("#glider-select").should("have.value", oldGliderId);
    cy.get("#glider-select")
      .select(newGliderId)
      .should("have.value", newGliderId);

    cy.textareaIncludes("[data-cy=flight-report-textarea]", oldFlightReport);
    cy.get("[data-cy=flight-report-textarea]")
      .clear()
      .type(newFlightReport)
      .should("have.value", newFlightReport);

    cy.get("#hikeAndFlyCheckbox").should("not.be.checked").check();
    cy.get("#logbookCheckbox").should("not.be.checked").check();

    // TODO: Check photos

    cy.get("button").contains("Speichern").click();
    cy.url().should("include", `/flug/${editableFlightId}`);

    cy.get("#cyFlightDetailsTable1").contains("td", "U-Turn Bodyguard");
    cy.get("#cyFlightDetailsTable1").contains("td", "400m Höhenunterschied");

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
    cy.get("button").contains("Flug bearbeiten").click();
    cy.url().should("include", `/flug/${nonEditableFlightId}/bearbeiten`);
  });

  it("Check that admin is able to delete flight", () => {
    cy.loginAdminUser();
    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").click();
    cy.url().should("include", `/flug/${nonEditableFlightId}/bearbeiten`);

    cy.get("#cyFlightDeleteButton").click();
    cy.get("#deleteFlightModal").should("be.visible");
    cy.get("button").contains("Löschen").click();

    cy.visit(`/flug/${nonEditableFlightId}`);

    cy.url().should("include", `/404/`);
  });
});
