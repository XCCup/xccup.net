import "cypress-file-upload";
import axios from "axios";

Cypress.Commands.add("clearIndexedDB", async () => {
  const databases = await window.indexedDB.databases();

  await Promise.all(
    databases.map(
      ({ name }) =>
        new Promise((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(name);

          request.addEventListener("success", resolve);
          // Note: we need to also listen to the "blocked" event
          // (and resolve the promise) due to https://stackoverflow.com/a/35141818
          request.addEventListener("blocked", resolve);
          request.addEventListener("error", reject);
        })
    )
  );
});

/**
 * Clears and reseeds the whole Database.
 */
Cypress.Commands.add("seedDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed");
});

/**
 * Clears and reseeds only flight depending data in the database (Tables: Flight, FlightFixes, FlightComments, FlightPhoto).
 */
Cypress.Commands.add("seedFlightDb", () => {
  cy.request("http://localhost:3000/api/testdata/seed?Flight=true");
});

/**
 * Clears the whole database. No app releated data will be left.
 */
Cypress.Commands.add("clearDb", () => {
  cy.request("http://localhost:3000/api/testdata/clear");
});

/**
 * Unfornually the bootstrap modal takes some time to load all its functionality. Without the wait it could be possible that the modal will not dispose after clicking.
 * Use this command to a add a wait() before clicking.
 */
Cypress.Commands.add("clickButtonInModal", (modalSelector, buttonText) => {
  // TODO: Find a better solution without a hard coded wait.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get(modalSelector).find("button").contains(buttonText).click();
});
/**
 * Unfornually the bootstrap modal takes some time to load all its functionality.
 * Use this command to a add a wait() before typing.
 */
Cypress.Commands.add("typeTextareaInModal", (modalSelector, text) => {
  // TODO: Find a better solution without a hard coded wait.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get(modalSelector).find("textarea").type(text);
});

/**
 * Logs in a user with a role of "Administrator" (Camille Schaden).
 */
Cypress.Commands.add("loginAdminUser", () => {
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type("steph@xccup.net");
  cy.get("input#password").type("PW_CamilleSchaden");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Camille");
});

/**
 * Logs in a user with no role (Ramona Gislason).
 */
Cypress.Commands.add("loginNormalUser", () => {
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type("blackhole+ramona@xccup.net");
  cy.get("input#password").type("PW_RamonaGislason");

  cy.get("button").contains("Anmelden").click();
  // Wait till button was updated
  cy.get("#userNavDropdownMenu").should("includes.text", "Ramona");
});

/**
 * Logs a user with the provided email and password in to the website.
 */
Cypress.Commands.add("login", (email, password) => {
  cy.get("#loginNavButton").click();
  cy.url().should("include", "/login");
  cy.get("h3").should("have.text", "Login");

  cy.get("input#email").type(email);
  cy.get("input#password").type(password);

  cy.get("button").contains("Anmelden").click();
  // Wait will landing page was successfully loaded; Prevent to fast transition to another after login
  cy.get("h1").should("includes.text", "XCCup");
});

/**
 * Logs the current user user out of the website.
 */
Cypress.Commands.add("logout", () => {
  cy.get("#userNavDropdownMenu").click();
  cy.get("li").contains("Abmelden").click();
  cy.get("#loginNavButton").should("includes.text", "Login");
});

/**
 * A command to verify if a textarea includes a provided text.
 */
Cypress.Commands.add("textareaIncludes", function (selector, text) {
  cy.get(selector).invoke("val").should("contains", text);
});

/**
 * A command to check if a recipient received an email which includes a text.
 */
Cypress.Commands.add(
  "recipientReceivedEmailWithText",
  function (recipientMail, text) {
    cy.wrap(null).then({ timeout: 7000 }, async () => {
      console.log("Looking up mails");
      let data;
      // Maybe the mail wasn't delivered yet. Therefore retry up to 3 times and wait for 1s between retries.
      for (let index = 0; index < 3; index++) {
        try {
          data = (
            await axios.get(
              `http://localhost:3000/api/testdata/email/${recipientMail}`
            )
          ).data;
          if (data?.message && data?.message.includes(text)) break;
        } catch (error) {
          console.log(error);
        } finally {
          await delay(2000);
        }
      }
      cy.task("log", data);
      console.log(data);
      console.log(JSON.stringify({ ...data }));
      expect(data?.message).to.exist;
      expect(data?.message).to.include(text);
    });
  }
);

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
