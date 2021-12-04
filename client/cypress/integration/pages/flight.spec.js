describe("check flight page", () => {
  before(() => {
    cy.visit("/flug/9");
  });

  it("test correct values for subnav", () => {
    const today = new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    cy.get("#flight-subnav").should(
      "include.text",
      `Flug von Ron Crooks am ${today}`
    );
  });

  it("check presence of map", () => {
    cy.get("#mapContainer");
  });

  it("check presence of barogramm", () => {
    cy.get("#flight-barogramm");
  });

  it("check airbuddies", () => {
    cy.get("button").contains("Airbuddies").click({ force: true });
    cy.get("h5").should("include.text", "Sonia Harber");

    // Test check box
  });

  it("check flight details", () => {
    cy.get("#flight-details");
    cy.get("h3").contains("Flugeigenschaften");

    // TODO: Test more details
  });

  it("check flight comments", () => {
    cy.get("#flight-comments");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44").contains(
      "Lois White"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46").contains(
      "Olive Emmerich"
    );

    // TODO: Test more details
  });

  it("check comment editor", () => {
    cy.get("#comment-editor");

    // TODO: Test more details
  });
});
