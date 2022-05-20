describe("check flight comments", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("check flight comments not editable when no one logged in", () => {
    cy.visit("/flug/9");
    cy.get("#flight-comments");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44").contains(
      "Lois White"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "Bearbeiten")
      .should("not.exist");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "Löschen")
      .should("not.exist");

    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46").contains(
      "Olive Emmerich"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46")
      .contains("a", "Bearbeiten")
      .should("not.exist");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46")
      .contains("a", "Löschen")
      .should("not.exist");
  });

  it("check flight comments editable by owner", () => {
    cy.login("blackhole+lois@xccup.net", "PW_LoisWhite");
    cy.visit("/flug/9");

    cy.get("#flight-comments");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44").contains(
      "Lois White"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "Bearbeiten")
      .should("exist");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "Löschen")
      .should("exist");

    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46").contains(
      "Olive Emmerich"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46")
      .contains("a", "Bearbeiten")
      .should("not.exist");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada46")
      .contains("a", "Löschen")
      .should("not.exist");
  });

  it.only("add new flight comment", () => {
    const expectedComment = "This is a test :-D";
    const expectedMailReceipient = "blackhole+ron@xccup.net";

    cy.login("blackhole+lois@xccup.net", "PW_LoisWhite");
    cy.visit("/flug/9");

    // Check that submit button is disabled when textarea is empty
    cy.get("[data-cy=submit-comment-button]").should("be.disabled");

    // Add new comment
    cy.get("[data-cy=text-editor-textarea]").type(expectedComment);
    cy.get("[data-cy=submit-comment-button]").click();

    // Check that comment is also present after reload
    cy.visit("/flug/9");
    cy.get("#flight-comments").contains(expectedComment);

    // Check that owner of flight received an email
    cy.receipentReceivedEmailWithText(expectedMailReceipient, expectedComment);
  });

  it("reply to other flight comment", () => {
    const expectedComment = "Hello there";
    const expectedUsername = "Clinton Hettinger";

    cy.login("blackhole+clinton@xccup.net", "PW_ClintonHettinger");
    cy.visit("/flug/9");

    // Reply to comment
    cy.get("#flight-comments")
      .contains(
        "qui ipsam voluptas voluptatem eum ad hic quae ut sunt accusantium delectus"
      )
      .parent()
      .within(() => {
        cy.get("[data-cy=reply-comment-button]").click();
        cy.get("[data-cy=text-editor-textarea]").type(expectedComment);
        cy.get("[data-cy=save-comment-button]").click();
      });

    // Check that comment is also present after reload
    cy.visit("/flug/9");
    cy.get("#flight-comments").contains(expectedComment);
    cy.get("#flight-comments").contains(expectedUsername);
  });

  it("edit existing flight comment", () => {
    const expectedNewComment = "Tri tra trulala";
    const expectedOldComment = "ipsa impedit officiis dolorum";

    cy.loginAdminUser();
    cy.visit("/flug/9");

    // Reply to comment
    cy.get("#flight-comments")
      .contains(expectedOldComment)
      .parent()
      .within(() => {
        cy.get("[data-cy=admin-edit-comment]").click();
        cy.get("[data-cy=text-editor-textarea]").type(expectedNewComment);
        cy.get("[data-cy=save-comment-button]").click();
      });

    // Check that comment has new value also after reload
    cy.visit("/flug/9");
    cy.get("#flight-comments").not().contains(expectedOldComment);
    cy.get("#flight-comments").contains(expectedNewComment);
  });

  it("check all flight comments editable by admin", () => {
    cy.loginAdminUser();
    cy.visit("/flug/9");

    cy.get("#flight-comments");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44").contains(
      "Lois White"
    );
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "(Admin)")
      .should("exist");
    cy.get("#comment-5edc5c1c-3421-41f4-8d39-cb8f2f8ada44")
      .contains("a", "(Admin)")
      .should("exist");
  });
});
