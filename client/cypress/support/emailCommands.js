import "cypress-file-upload";
import axios from "axios";
import { delay } from "./utils";

/**
 * A command to check if a recipient received an email which includes a text.
 */
Cypress.Commands.add(
  "recipientReceivedEmailWithText",
  function (recipientMail, text) {
    if (!recipientMail) throw new Error("No email provided");
    if (!text) throw new Error("No text provided");
    const url = `http://localhost:3000/api/testdata/email/${recipientMail}`;
    cy.log(url);

    cy.wrap(null).then({ timeout: 15000 }, async () => {
      let success = false;

      // Maybe the mail wasn't delivered yet. Therefore retry up to 3 times and wait for 1s between retries.
      for (let index = 0; index < 10; index++) {
        try {
          const res = await axios.get(url);
          if (res?.data?.message && res?.data?.message.includes(text)) {
            success = true;
            break;
          }
          await delay(1000);
        } catch (error) {
          cy.log(error);
          await delay(1000);
        }
      }
      if (!success) throw new Error("Message not found");
    });
  }
);
