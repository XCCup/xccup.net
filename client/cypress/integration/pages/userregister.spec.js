describe("check users register page", () => {
  before(() => {
    cy.seedDb();
  });
  beforeEach(() => {
    cy.visit("/registrieren");
  });

  it("Register new user", () => {
    const expectedPasswort = "Foobar2!";
    const expectedPasswortWeak = "Hallo";
    const expectedCountry = "Deutschland";

    // cy.get("h3").should("have.text", `Registrieren`);
    cy.get("h3").contains(`Registrieren`);

    cy.get("#firstName").type("Foo");
    cy.get("#lastName").type("Bar");
    cy.get("#email").type("foo@bar.fake");
    cy.get("#gender").select("M").should("have.value", "M");

    cy.get("#birthday").click();
    for (let index = 0; index < 3; index++) {
      cy.get(".v3dp__heading__button").first().click();
    }
    cy.get(".v3dp__elements").find("button").contains("1994").click();
    cy.get(".v3dp__elements").find("button").contains("Mai").click();
    cy.get(".v3dp__elements").find("button").contains("01").click();

    cy.get("#country")
      .select(expectedCountry)
      .should("have.value", expectedCountry);
    cy.get("#club")
      .select("D.G.F. Rhein-Mosel-Lahn")
      .should("have.value", "c2026874-9cf0-4793-ad9a-66e22aea86af");
    cy.get("#shirtSize").select("XL").should("have.value", "XL");
    cy.get("#password").type(expectedPasswort);
    cy.get("#passwordConfirm").type(expectedPasswort);
    cy.get("#acceptRulesCheckbox").check();

    // All fields are valid. Submit button should be enabled
    cy.get("Button").contains("Registrieren").should("be.enabled");

    // Change accept rules checkbox
    cy.get("#acceptRulesCheckbox").uncheck();
    cy.get("Button").contains("Registrieren").should("be.disabled");
    cy.get("#acceptRulesCheckbox").check();

    // Add weak password
    cy.get("#password").clear().type(expectedPasswortWeak);
    cy.get("#passwordConfirm").clear().type(expectedPasswortWeak);
    cy.get("Button").contains("Registrieren").should("be.disabled");

    // Readd correct password
    cy.get("#password").clear().type(expectedPasswort);
    cy.get("#passwordConfirm").clear().type(expectedPasswort);

    cy.get("Button").contains("Registrieren").click();
    cy.get(".swal2-popup")
      .should("be.visible")
      .contains(
        "Um deinen Account zu aktivieren öffne bitte den Link den wir dir gerade per Email geschickt haben."
      );
    cy.get(".swal2-confirm").click();
    cy.url().should("include", "/");
    cy.get("h1").should("have.text", `XCCup ${new Date().getFullYear()}`);
  });

  it("Register user with same email address twice", () => {
    const expectedPasswort = "Foobar2!";
    const expectedCountry = "Belgien";
    const expectedMail = "foo@bar.fake";

    cy.get("h3").contains(`Registrieren`);

    cy.get("#firstName").type("Foo");
    cy.get("#lastName").type("Bar");
    cy.get("#email").type(expectedMail);
    cy.get("#gender").select("M").should("have.value", "M");

    cy.get("#birthday").click();
    for (let index = 0; index < 3; index++) {
      cy.get(".v3dp__heading__button").first().click();
    }
    cy.get(".v3dp__elements").find("button").contains("1996").click();
    cy.get(".v3dp__elements").find("button").contains("Feb").click();
    cy.get(".v3dp__elements").find("button").contains("28").click();

    cy.get("#country")
      .select(expectedCountry)
      .should("have.value", expectedCountry);
    cy.get("#club")
      .select("D.G.F. Rhein-Mosel-Lahn")
      .should("have.value", "c2026874-9cf0-4793-ad9a-66e22aea86af");
    cy.get("#shirtSize").select("XL").should("have.value", "XL");
    cy.get("#password").type(expectedPasswort);
    cy.get("#passwordConfirm").type(expectedPasswort);
    cy.get("#acceptRulesCheckbox").check();

    cy.get("Button").contains("Registrieren").click();

    cy.get("#errorMessageText").contains("Diese E-Mail existiert bereits");
  });
});
