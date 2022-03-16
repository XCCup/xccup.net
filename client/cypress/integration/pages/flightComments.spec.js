describe("check flight comments", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
    // TODO: Shouldn't there be a db seed to make this working on it's own?
  });

  it("check flight comments not editable", () => {
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

  it("check flight comments editable by user", () => {
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
