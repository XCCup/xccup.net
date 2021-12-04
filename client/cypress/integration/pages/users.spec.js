describe("check users page", () => {
  before(() => {
    cy.seedDb();
  });
  beforeEach(() => {
    cy.visit("/");
  });

  it("test page only accessable for logged-in users", () => {
    cy.get("#navbarLists").click();

    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    cy.location("pathname").should("eq", "/login");
  });

  it("test send mail to user", () => {
    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    cy.get("#userListView").find(".cy-mail-button").first().click();

    cy.get("#userMailModal").within(() => {
      cy.get("#sendMailModalLabel").should("include.text", "Adam Bayer");

      // Without content button should be disabled
      cy.get("button").contains("Senden").should("be.disabled");

      cy.get("input").type("Der Betreff");
      cy.get("textarea").type("Hier kommt der Inhalt rein");

      // FIXME: Possible race condition between typing and fully usable bootstrap modal; Sometimes there is no value inside textfields. Therefore the submit button is still disabled.
      // cy.get("button").contains("Senden").click();

      // cy.get(".modal-body").should(
      //   "include.text",
      //   "Deine Nachricht wurde versendet"
      // );
    });
  });

  it("test all active users are shown", () => {
    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    const users = require("../../../../server/test/testdatasets/users.json");

    const activeUsers = users.filter((user) => user.role != "Inaktiv");

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .should("have.length", activeUsers.length);

    activeUsers.forEach((user) => {
      cy.get("#userListView")
        .find(".cy-user-name-label")
        .filter(`:contains("${user.firstName} ${user.lastName}")`);
    });
  });

  it("test all inactive users are not shown", () => {
    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    const users = require("../../../../server/test/testdatasets/users.json");

    const inactiveUsers = users.filter((user) => user.role == "Inaktiv");

    inactiveUsers.forEach((user) => {
      cy.get("#userListView")
        .find(".cy-user-name-label")
        .not(`:contains("${user.firstName} ${user.lastName}")`);
    });
  });
});
