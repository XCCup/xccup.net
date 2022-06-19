describe("check sponsors page", () => {
  before(() => {
    cy.visit("/sponsoren");
  });

  it("test correct values for infobox", () => {
    cy.get("h3").should(
      "have.text",
      `Sponsoren des Jahres ${new Date().getFullYear()}`
    );

    cy.get("h5").should("have.length", 20);
  });
});
