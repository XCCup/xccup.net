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
 * A command to verify if a textarea includes a provided text.
 */
Cypress.Commands.add("textareaIncludes", function (selector, text) {
  cy.get(selector).invoke("val").should("contains", text);
});
