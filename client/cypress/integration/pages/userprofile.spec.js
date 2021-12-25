describe("Check user profile", () => {
  beforeEach(() => {
    cy.seedDb();
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
    cy.get("#email").should("have.value", "blackhole+ramona@stephanschoepe.de");
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

    cy.login("blackhole+clinton@stephanschoepe.de", "PW_ClintonHettinger");
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

    cy.login("blackhole+clinton@stephanschoepe.de", newPassword);
    cy.get("#userNavDropdownMenu").should("includes.text", "Clinton");

    // cy.wait(2000);
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("#firstName").should("have.value", "Clinton");
    cy.get("#lastName").should("have.value", "Hettinger");
  });

  it("Visit profile and change default glider", () => {
    cy.get("h3", {
      timeout: 10000,
    }).should("have.text", `Login`);

    cy.loginNormalUser();

    cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");

    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("[data-cy=hangar-tab]").click();
    cy.get("[data-cy=user-profile-glider-list]")
      .should("be.visible")
      .within(() => {
        cy.get("input").should("have.length", 2);
        cy.get(
          "[data-cy=glider-list-item-cd25b974-1e30-4969-ba46-34990461990d]"
        )
          .should("include.text", "Flow XC Racer (GS Performance low)")
          .within(() => {
            cy.get("input").should("be.checked");
          });
        cy.get(
          "[data-cy=glider-list-item-8f48aa72-6ea0-477e-ae3c-e76fa99e7fb5]"
        )
          .should("include.text", "U-Turn Bodyguard (GS Sport low)")
          .within(() => {
            cy.get("input").should("not.be.checked").click();
          })

          .within(() => {
            cy.get("input").should("be.checked");
          });
      });
    cy.get(".swal2-popup").should("be.visible");
  });

  it("Visit profile and delete glider", () => {
    cy.get("h3", {
      timeout: 10000,
    }).should("have.text", `Login`);

    cy.loginNormalUser();
    cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("[data-cy=hangar-tab]").click();
    cy.get("[data-cy=user-profile-glider-list]")
      .should("be.visible")
      .within(() => {
        cy.get("input").should("have.length", 2);
        cy.get(
          "[data-cy=glider-list-item-cd25b974-1e30-4969-ba46-34990461990d]"
        )
          .should("include.text", "Flow XC Racer (GS Performance low)")
          .within(() => {
            cy.get("[data-cy=delete-glider]").click();
          });
      });
    cy.clickButtonInModal("#removeGliderModal", "OK");
    cy.get("[data-cy=user-profile-glider-list]")
      .should("be.visible")
      .within(() => {
        cy.get("input").should("have.length", 1);

        cy.get(
          "[data-cy=glider-list-item-8f48aa72-6ea0-477e-ae3c-e76fa99e7fb5]"
        )
          .should("include.text", "U-Turn Bodyguard (GS Sport low)")
          .within(() => {
            cy.get("input").should("be.checked");
          });
      });
  });

  it("Visit profile and add glider", () => {
    cy.get("h3", {
      timeout: 10000,
    }).should("have.text", `Login`);

    cy.loginNormalUser();
    cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
    cy.visit("/profil");

    cy.get("h4", {
      timeout: 10000,
    }).should("have.text", `Profil`);

    cy.get("[data-cy=hangar-tab]").click();
    cy.get("[data-cy=user-profile-glider-list]").should("be.visible");

    cy.get("[data-cy=add-glider-button]").click();

    const brand = "Little Cloud";
    const gliderName = "Foo 2";
    const rankingClass = "Schirme EN A+B mit einer Streckung <5,2";
    cy.get("#addGliderModal").within(() => {
      cy.get("#brand-select").select(brand).should("have.value", brand);
      cy.get("#glider-name").type(gliderName);
      cy.get("[data-cy=save-new-glider-button]").should("be.disabled");
      cy.get("#ranking-class-select").select(rankingClass);
      cy.get("[data-cy=save-new-glider-button]").should("be.enabled").click();
    });
    cy.get("#addGliderModal").should("not.be.visible");

    cy.get("[data-cy=user-profile-glider-list]")
      .should("be.visible")
      .within(() => {
        cy.get("div")
          .should("have.length", 3)
          .last()
          .should("include.text", "Little Cloud Foo 2 (GS Sport low)");
      });
  });
});
