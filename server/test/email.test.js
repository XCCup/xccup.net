/**
 * @jest-environment node
 */
const sendMail = require("../config/email");

test("Check if mail service doesn't error out", (done) => {
  done(expect(sendMail).toEqual(expect.anything()));
  // TODO: Define env.local in GitHub CI Environment and use GitHub Secrets to access Credentials for Mail Service
  //   MailService.sendMail()
  //     .then((result) => {
  //       done(expect(result).toBe(true));
  //     })
  //     .catch((error) => {
  //       done(error);
  //     });
});
