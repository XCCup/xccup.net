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

  it("test filter on part name", () => {
    const expectedNames = ["Camille Schaden", "Christie Schaefer"];
    const expectedLength = 2;

    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    cy.get("#filterButton").click();

    /*eslint-disable */
    // TODO: Find better solution
    // Wait will modal was fully rendered, otherwise the typing may not be successful
    cy.wait(1000);

    cy.get("[data-cy=activate-filter-button]").should("be.visible");
    cy.get("#filterSelectName").type("Sc");
    cy.get("button").contains("Anwenden").click();

    cy.get("[data-cy=filter-icon]").should("be.visible");

    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .should("have.length", expectedLength);

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .filter(`:contains("${expectedNames[0]}")`);

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .filter(`:contains("${expectedNames[0]}")`);
  });

  it("test filter type full name", () => {
    const expectedName = "Camille Schaden";
    const expectedLength = 1;

    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    cy.get("#filterButton").click();

    /*eslint-disable */
    // TODO: Find better solution
    // Wait will modal was fully rendered, otherwise the typing may not be successful
    cy.wait(1000);
    cy.get("[data-cy=activate-filter-button]").should("be.visible");
    cy.get("#filterSelectName").should("have.text", "");

    cy.get("#filterSelectName").type(expectedName);
    cy.get("button").contains("Anwenden").click();
    cy.get("[data-cy=filter-icon]").should("be.visible");

    // Wait till table is updated otherwise its() will always resolve to 25
    // cy.wait(1000);
    /*eslint-enable */

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .should("have.length", expectedLength);

    cy.get("#userListView")
      .find(".cy-user-name-label")
      .filter(`:contains("${expectedName}")`);
  });
});
