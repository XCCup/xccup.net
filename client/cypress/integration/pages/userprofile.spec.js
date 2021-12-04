describe("Check user profile", () => {
  beforeEach(() => {
    cy.visit("/profil");
  });

  it("Visit profile as guest", () => {
    cy.get("h3").should("have.text", `Login`);
  });

  it("Visit profile as logged in user", () => {
    cy.loginNormalUser();
    cy.visit("/profil");

    cy.get("h4").should("have.text", `Profil`);

    cy.get("#firstName").should("have.value", "Ramona");
    cy.get("#lastName").should("have.value", "Gislason");
    cy.get("#club").should("have.value", "1. Pfälzer DGFC");
    cy.get("#email").should("have.value", "Ramona@Gislason.name");
    cy.get("#street").should("have.value", "35975 Emmalee Forge");
    cy.get("#zip").should("have.value", "49453-5006");
    cy.get("#city").should("have.value", "South Skye");

    cy.get("#state").should("have.value", "Hessen");
    cy.get("#country").should("have.value", "Deutschland");

    cy.get("#gender").should("have.value", "W");
    // TODO: How to check this?
    // cy.get("#birthday").should("have.value", "16.01.1983");
    cy.get("#shirtSize").should("have.value", "M");

    // Checkboxes
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
    // const expectedBirthday = "01.01.2000";
    const expectedShirtSize = "XL";

    cy.loginNormalUser();
    cy.visit("/profil");

    cy.get("h4").should("have.text", `Profil`);

    cy.get("#firstName").clear().type(expectedFirstName);
    cy.get("#lastName").clear().type(expectedLastName);
    cy.get("#lastName").clear().type(expectedLastName);
    cy.get("#street").clear().type(expectedStreet);
    cy.get("#zip").clear().type(expectedZip);
    cy.get("#city").clear().type(expectedCity);

    cy.get("#state").select(expectedState).should("have.value", expectedState);
    // TODO: Birthday
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
    // TODO: birthday

    cy.get("#shirtSize").should("have.value", expectedShirtSize);

    // Checkboxes
    cy.get("#notifyForComment").should("be.checked");
    cy.get("#optInNewsletter").should("be.checked");

    cy.get("Button").contains("Speichern").should("be.disabled");
  });
});
