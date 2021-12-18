describe("Check news page", () => {
  before(() => {
    cy.seedDb();
    cy.visit("/news");
  });

  it("test news list", () => {
    cy.get("[data-cy=list-news]").find("h2").should("have.text", "News");
    cy.get("[data-cy=news-item]").should("have.length", 3);

    // The news-item component is already tested in detail in the home.spec
    // Here it's is only checked that the text is not snipped.

    cy.get("[data-cy=news-item]")
      .first()
      .within(() => {
        cy.get("[data-cy=news-item-text]").should(
          "not.include.text",
          "temporib…"
        );
      });
  });
});
