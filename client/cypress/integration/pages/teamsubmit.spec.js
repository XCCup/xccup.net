describe("check flyingsites page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("test site access only allowed for logged in users", () => {
    cy.visit("/teammeldung");

    cy.location("pathname").should("eq", "/login");
  });

  it("test user is already in a team", () => {
    cy.login("blackhole+leo@xccup.net", "PW_LeoAltenwerth");
    cy.visit("/teammeldung");

    cy.get("h3").should("have.text", "Teammeldung");
    cy.get("[data-cy=team-submit-already-associated]").should(
      "includes.text",
      "Du bist bereits in einem Team angemeldet"
    );
  });

  it("test submit a new team", () => {
    const expectedTeamName = "Le Foobars";
    const expectedTeamNameAlreadyInUser = "Die Elstern";
    const expectedSubmitter = "Olive Emmerich";
    const expectedUserNames = [
      "Lois White",
      "Clinton Hettinger",
      "Christie Schaefer",
      "Everett Gislason",
    ];
    cy.login("blackhole+olive@xccup.net", "PW_OliveEmmerich");
    cy.visit("/teammeldung");

    cy.get("h3").should("have.text", "Teammeldung");

    // Add users to member list
    expectedUserNames.forEach((userName) => {
      cy.get("[data-cy=team-select-member]").type(userName);
      cy.get("button").contains("Mitglied hinzufügen").click();
    });

    // Check that member adding is disabled
    cy.get("button").contains("Mitglied hinzufügen").should("be.disabled");

    // Check that all added members and the submitter are listed
    cy.get("[data-cy=team-list-members]")
      .find("li")
      .its("length")
      .should("eq", 5);
    expectedUserNames.forEach((userName) => {
      cy.get("[data-cy=team-list-members]")
        .find("li")
        .should("includes.text", userName);
    });
    cy.get("[data-cy=team-list-members]")
      .find("li")
      .should("includes.text", expectedSubmitter);

    // Check that a already used team name is not possible
    cy.get("[data-cy=team-input-team]").type(expectedTeamNameAlreadyInUser);
    cy.get("button").contains("Teammeldung absenden").should("be.disabled");

    // Submit team
    cy.get("[data-cy=team-input-team]").clear().type(expectedTeamName);
    cy.get("button").contains("Teammeldung absenden").should("be.enabled");
    cy.get("button").contains("Teammeldung absenden").click();

    cy.get("[data-cy=team-submit-successful]").should(
      "includes.text",
      "Deine Meldung war erfolgreich"
    );

    // Check team ranking
    cy.visit(`${new Date().getFullYear()}/teamwertung`);
    cy.get("table").contains("td", expectedTeamName);
    expectedUserNames.forEach((userName) => {
      cy.get("table").contains("td", userName);
    });
  });
});
