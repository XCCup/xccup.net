describe("Check user profile", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/profil");
  });

  it("Visit profile as guest", () => {
    cy.get("h3").should("have.text", `Login`);
  });

  it("Visit profile as logged in user", () => {
    cy.loginNormalUser();
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("#firstName").should("have.value", "Ramona");
    cy.get("#lastName").should("have.value", "Gislason");
    cy.get("#club").should("have.value", "1. Pfälzer DGFC");
    cy.get("#email").should("have.value", "Ramona@Gislason.fake");
    cy.get("#street").should("have.value", "35975 Emmalee Forge");
    cy.get("#zip").should("have.value", "49453-5006");
    cy.get("#city").should("have.value", "South Skye");

    cy.get("#state").should("have.value", "Hessen");
    cy.get("#country").should("have.value", "Deutschland");

    cy.get("#gender").should("have.value", "W");
    cy.get(".v3dp__datepicker")
      .find("input")
      .should("have.value", "16.01.1983");
    cy.get("#shirtSize").should("have.value", "M");

    // Checkboxes
    cy.get("#notifyForComment").uncheck();
    cy.get("#optInNewsletter").uncheck();
    cy.get("#notifyForComment").should("not.be.checked");
    cy.get("#optInNewsletter").should("not.be.checked");

    cy.get("Button").contains("Speichern").should("be.disabled");
  });

  it("Visit profile and edit user details", () => {
    const expectedFirstName = "Foo";
    const expectedLastName = "Bar";
    const expectedStreet = "Street";
    const expectedZip = "3628";
    const expectedCity = "New Foo";
    const expectedState = "Niedersachsen";
    const expectedCountry = "Deutschland";
    const expectedGender = "M";
    const birthday = { day: "13", month: "Jun", year: "1987" };
    const expectedBirthday = "13.06.1987";
    const expectedShirtSize = "XL";

    cy.loginNormalUser();
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("#city").clear().type(expectedCity);
    cy.get("Button").contains("Speichern").should("not.be.disabled");

    cy.get("#firstName").clear().type(expectedFirstName);
    cy.get("#lastName").clear().type(expectedLastName);
    cy.get("#lastName").clear().type(expectedLastName);
    cy.get("#street").clear().type(expectedStreet);
    cy.get("#zip").clear().type(expectedZip);

    cy.get("#state").select(expectedState).should("have.value", expectedState);

    cy.get("#birthday").click();
    cy.get(".v3dp__elements").find("button").contains(birthday.year).click();
    cy.get(".v3dp__elements").find("button").contains(birthday.month).click();
    cy.get(".v3dp__elements").find("button").contains(birthday.day).click();

    cy.get("#country")
      .select(expectedCountry)
      .should("have.value", expectedCountry);

    cy.get("#gender")
      .select(expectedGender)
      .should("have.value", expectedGender);

    cy.get("#shirtSize")
      .select(expectedShirtSize)
      .should("have.value", expectedShirtSize);

    // Checkboxes
    cy.get("#notifyForComment").check();
    cy.get("#optInNewsletter").check();

    cy.get("Button").contains("Speichern").should("not.be.disabled").click();

    // Check if all edits are correct

    cy.get("h4").should("have.text", `Profil`);

    cy.get("#firstName").should("have.value", expectedFirstName);
    cy.get("#lastName").should("have.value", expectedLastName);
    cy.get("#street").should("have.value", expectedStreet);
    cy.get("#zip").should("have.value", expectedZip);
    cy.get("#city").should("have.value", expectedCity);

    cy.get("#state").should("have.value", expectedState);
    cy.get("#country").should("have.value", expectedCountry);

    cy.get("#gender").should("have.value", expectedGender);
    cy.get(".v3dp__datepicker")
      .find("input")
      .should("have.value", expectedBirthday);

    cy.get("#shirtSize").should("have.value", expectedShirtSize);

    // Checkboxes
    cy.get("#notifyForComment").should("be.checked");
    cy.get("#optInNewsletter").should("be.checked");

    cy.get("Button").contains("Speichern").should("be.disabled");
  });

  it("Visit profile and change password", () => {
    const newPassword = "Foobar2!";
    const badPassword = "foobar";

    cy.get("h3", {
      timeout: 10000,
    }).should("have.text", `Login`);

    cy.login("Clinton@Hettinger.fake", "PW_ClintonHettinger");
    cy.get("#userNavDropdownMenu").should("includes.text", "Clinton");

    // cy.wait(2000);

    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("[data-cy=change-password-tab]").click();
    cy.get("[data-cy=password-input]").type(badPassword);
    cy.get("[data-cy=password-change-btn]").should("be.disabled");
    cy.get("[data-cy=password-confirm-input]").type(badPassword);
    cy.get("[data-cy=password-change-btn]").should("be.disabled");

    cy.get("[data-cy=password-input]").clear().type(newPassword);
    cy.get("[data-cy=password-confirm-input]").clear().type(newPassword);
    cy.get("[data-cy=password-change-btn]").should("not.be.disabled").click();
    cy.get(".swal2-title").should("be.visible");

    cy.visit("/");
    cy.logout();

    cy.login("Clinton@Hettinger.fake", newPassword);
    cy.get("#userNavDropdownMenu").should("includes.text", "Clinton");

    // cy.wait(2000);
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("#firstName").should("have.value", "Clinton");
    cy.get("#lastName").should("have.value", "Hettinger");
  });
});
