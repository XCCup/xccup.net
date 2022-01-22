describe("check flight page", () => {
  before(() => {
    cy.visit("/flug/9");
  });

  beforeEach(() => {
    cy.clearIndexedDB();
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

  it("check presence of position flight stats", () => {
    cy.get("#positionStatsTable").should("exist");
  });

  it("check airbuddies", () => {
    cy.get("button").contains("Airbuddies").click({ force: true });
    cy.get("h5").should("include.text", "Sonia Harber");

    // TODO: Test check box and visit buddy flight
  });

  it("check flight details", () => {
    cy.get("#flight-details");
    cy.get("h3").contains("Flugeigenschaften");

    // TODO: Test more details
  });

  it("check non presence of airspace comment", () => {
    cy.get("[data-cy=airspace-comment]").should("not.exist");
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

  it("check add a new comment", () => {
    const link = "https://www.xccup.net";
    const newComment = `Foo Bar ${link}`;
    cy.loginNormalUser();
    cy.visit("/flug/9");

    cy.get("[data-cy=text-editor-textarea]").clear().type(" ");
    cy.get("[data-cy=submit-comment-button]").should("be.disabled");
    cy.get("[data-cy=text-editor-textarea]").clear().type(newComment);
    cy.get("[data-cy=submit-comment-button]").should("not.be.disabled").click();
    cy.visit("/flug/9"); // Make sure commet is already there

    cy.get("[data-cy=flight-comment]")
      .last()
      .within(() => {
        cy.get("[data-cy=comment-header]").should("include.text", "Ramona");
        cy.get("[data-cy=comment-body]")
          .should("have.text", newComment)
          .within(() => {
            cy.get("a").should("have.text", link);
            // Visiting the link does not work due to CORS policy
            // .invoke("removeAttr", "target")
            // .click();
          });
      });
    // cy.url().should("include", link);
  });

  it("try to add evil comment", () => {
    const expectedComment = "PWND";
    const evilComment = `<script>window.open("https://www.xccup.net")</script>${expectedComment}`;

    // TODO: How to login if the previous test failed?
    // TODO: Ask When is a user logged out exactly
    cy.visit("/");
    cy.loginNormalUser();
    cy.visit("/flug/9");

    cy.get("[data-cy=text-editor-textarea]").clear().type(evilComment);
    cy.get("[data-cy=submit-comment-button]").should("not.be.disabled").click();
    cy.visit("/flug/9");

    cy.get("[data-cy=flight-comment]")
      .last()
      .within(() => {
        cy.get("[data-cy=comment-header]").should("include.text", "Ramona");
        cy.get("[data-cy=comment-body]").should("have.text", expectedComment);
      });
  });
});
