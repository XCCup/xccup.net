describe("check users page", () => {
  before(() => {
    cy.seedDb();
  });
  beforeEach(() => {
    cy.visit("/");
  });

  it("test page only accessible for logged-in users", () => {
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

  it("delete user and remove personal information", () => {
    const userToDelete = "Leo Altenwerth";
    const expectedName = "Gelöschter Benutzer";
    const flightWithPhotosOfUser = 2;
    const flightWithCommentsOfUser = 40;
    const flightNotRelated = 37;
    const userNotRelated = "Everett Gislason";
    const userMail = "blackhole+leo@xccup.net";
    const userPw = "PW_LeoAltenwerth";

    cy.login(userMail, userPw);

    // Delete user
    cy.visit("/profil");
    cy.get("#nav-profil-deactivate-tab").click();

    cy.get("[data-cy='userDeleteButton']").click();
    cy.clickButtonInModal("#confirmUserDeactivationModal", "Profil löschen");

    // Logoff and redirect to homepage
    cy.get("h1").should("contain.text", "XCCup");
    cy.get("#userNavDropdownMenu").should("not.exist");

    // Login shouldn't be possible anymore
    cy.get("#loginNavButton").click();
    cy.url().should("include", "/login");

    cy.get("input#email").type(userMail);
    cy.get("input#password").type(userPw);

    cy.get("button").contains("Anmelden").click();

    cy.get("#loginErrorMessage").should(
      "includes.text",
      "Benutzername/Passwort falsch"
    );

    // User shouldn't be listed anymore; Login as a different user
    cy.loginNormalUser();

    cy.get("#navbarLists").click();
    cy.get("#navbarLists").find("li").contains("Registrierte Piloten").click();

    cy.get(".cy-user-name-label").should("not.contain", userToDelete);

    cy.visit(`flug/${flightWithPhotosOfUser}`);

    cy.url().should("include", "/404");

    // TODO: Test will fail if running off season. Find a way to get around that.
    // Code for off season below

    // Pilot name in flight should not be deleted
    // Photos of user should be deleted

    // cy.get("h4").should("not.include.text", userToDelete);
    // cy.get("h4").should("include.text", expectedName);

    // cy.get("photo-0").should("not.exist");
    // cy.get("photo-1").should("not.exist");
    // cy.get("photo-2").should("not.exist");
    // cy.get("photo-3").should("not.exist");

    // Check for side effects:
    cy.visit(`flug/${flightNotRelated}`);
    cy.get("h4").should("include.text", userNotRelated);

    // No user comment should be left
    cy.visit(`flug/${flightWithCommentsOfUser}`);

    cy.get("[data-cy='flight-comment']").should("contain.text", expectedName);
    cy.get("[data-cy='flight-comment']").should(
      "not.contain.text",
      userToDelete
    );
    cy.get("[data-cy='flight-comment']").should(
      "contain.text",
      "Gelöschter Inhalt"
    );
  });
});
