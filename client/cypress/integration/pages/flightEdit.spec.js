describe("check flight page", () => {
  const flightId = 6;

  before(() => {
    cy.seedDb();
    cy.visit("/");
    cy.loginNormalUser();
    cy.visit(`/flug/${flightId}`);
  });

  it("Check presence and function of edit button", () => {
    cy.get("#flight-details");
    cy.get("button").contains("Flug bearbeiten").click();
    cy.url().should("include", `/flug/${flightId}/bearbeiten`);
  });

  const oldGliderId = "cd25b974-1e30-4969-ba46-34990461990d";
  const newGliderId = "8f48aa72-6ea0-477e-ae3c-e76fa99e7fb5";

  // const oldFlightReport = "eius ullam omnis nesciunt amet dolorem";
  const newFlightReport = "Foo";

  it("check edit flight details", () => {
    cy.get("#glider-select").should("have.value", oldGliderId);
    cy.get("#glider-select")
      .select(newGliderId)
      .should("have.value", newGliderId);
    cy.get("button").contains("Liste bearbeiten");

    // TODO: How to check for a fragment of text?
    // cy.get("#flightReport").contains(oldFlightReport);
    cy.get("#flightReport").clear().type(newFlightReport);

    cy.get("#hikeAndFlyCheckbox").should("not.be.checked").check();
    cy.get("#logbookCheckbox").should("not.be.checked").check();

    // TODO: Check photos

    cy.get("button").contains("Speichern").click();
    cy.url().should("include", `/flug/${flightId}`);

    // TODO: How to chain this?
    cy.get("#cyFlightDetailsTable1").contains("td", "U-Turn Bodyguard");
    cy.get("#cyFlightDetailsTable1").contains("td", "400m Höhenunterschied");

    cy.get("#flightDetailsButton").contains("Details anzeigen").click();
    cy.get("#moreFlightDetailsTable").contains("td", "Flugbuch");

    cy.get("#flightReport").should("have.text", newFlightReport);
  });
});
