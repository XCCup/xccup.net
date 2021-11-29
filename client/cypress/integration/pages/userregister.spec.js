describe("check users register page", () => {
  before(() => {
    cy.visit("/registrieren");
  });

  it("Register new user", () => {
    cy.get("h3").should("have.text", `Registrieren`);

    cy.get("#firstName").type("Foo");
    cy.get("#lastName").type("Bar");
    cy.get("#email").type("foo@bar.org");
    cy.get("#gender").select("M").should("have.value", "M");
    cy.get("#birthday").click();

    // TODO: How to test the next step in datepicker?
    // cy.get("Button")
    //   .contains(
    //     '<path stroke="none" d="M-9 16V-8h24v24z" data-v-2e128338="" data-v-2e128338-s=""></path>'
    //   )
    //   .click();
    // cy.get("Button").contains("2004").click();
    // cy.get("Button").contains("Mai").click();
    // cy.get("Button").contains("01").click();

    cy.get("#birthday").type("1968-01-01!");

    cy.get("#country")
      .select("Deutschland")
      .should("have.value", "Deutschland");
    cy.get("#club")
      .select("D.G.F. Rhein-Mosel-Lahn")
      .should("have.value", "c2026874-9cf0-4793-ad9a-66e22aea86af");
    cy.get("#shirtSize").select("XL").should("have.value", "XL");
    cy.get("#password").type("Foobar2!");
    cy.get("#passwordConfirm").type("Foobar2");

    cy.get("Button").contains("Anmelden").should("be.disabled");

    cy.get("#passwordConfirm").type("Foobar2!");

    cy.get("#acceptRulesCheckbox").uncheck();
    cy.get("Button").contains("Anmelden").should("be.disabled");
    cy.get("#acceptRulesCheckbox").check();

    cy.get("Button").contains("Anmelden").click();

    cy.get("#registerConfirmation")
      .find("p")
      .contains(
        "Um deinen Account zu aktivieren öffne bitte den Link den wir dir gerade per Email geschickt haben."
      );
  });
});
