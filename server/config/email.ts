import nodemailer from "nodemailer";
import logger from "./logger";
import config from "../config/env-config";
import retrieveTestMail from "../parser/etherealMailParser";
import testEmailCache from "../test/testEmailCache";

const prodSmtp = {
  host: config.get("mailServiceUrl"),
  secure: true,
  auth: {
    user: config.get("mailServiceUser"),
    pass: config.get("mailServicePassword"),
  },
};
let mailClient: nodemailer.Transporter | undefined;

async function initializeMailClient() {
  mailClient = await getMailCLient();
}

initializeMailClient();

async function createTestNodemailerTransport() {
  // Generate SMTP service account from ethereal.email
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (error: any) {
    console.error("Failed to create a testing account. " + error.message);
  }
}
interface MailContent {
  title: string;
  text: string;
  attachments?: any;
}

interface MailFrom {
  name: string;
  address: string;
}

/**
 * Sends an e-mail to a single recipent or multiple recipents.
 *
 * @param {string|Array} mailAddresses A single email address of type string oder multiple addresses as an array of strings.
 * @param {object} content A object containing a "title" and a "text" property of type string.
 * @param {string} [replyTo] The replyTo address which will be added to the send e-mail.
 * @returns Returns true if a mail was sucessfully delegated to the E-Mail Service Provider.
 */
const sendMail = async (
  mailAddresses: string | string[],
  content: MailContent,
  replyTo?: string
) => {
  if (
    !content.title ||
    !content.text ||
    content.title.length == 0 ||
    content.text.length == 0
  )
    throw new Error(
      "content.title and content.text are not allowed to be empty"
    );

  const message = createMessage(
    {
      name: config.get("mailServiceFromName"),
      address: config.get("mailServiceFromEmail"),
    },
    mailAddresses,
    content,
    replyTo
  );

  try {
    if (!mailClient) throw new Error("No mail client defined");

    const info = await mailClient.sendMail(message);
    logger.error("Mail sent to: " + info.accepted);

    if (config.get("env") !== "production") {
      logger.info("E: Check sent email in test smtp service");
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.error(previewUrl);
      logger.info("E: Preview URL: " + previewUrl);
      const receivedMail = await retrieveTestMail(previewUrl);
      logger.error("Received mail:");
      logger.error(receivedMail);
      testEmailCache.push(receivedMail);
      logger.info(
        "E: Sent email found in test smtp: " + JSON.stringify(receivedMail)
      );
    }

    logger.debug("E: Message sent: " + info.messageId);
  } catch (error) {
    // Message failed: 451 4.3.0 pymilter: untrapped exception in pythonfilter
    // This error indicates that the netcup mailservice doesn't allow to send mails from a different domain then the domain of the mail user account.
    logger.error("E: " + error);
  }

  return true;
};

async function getMailCLient() {
  if (config.get("env") !== "production") {
    logger.info("E: Use test smtp server");
    return await createTestNodemailerTransport();
  } else {
    logger.info("E: Use production smtp server");
    // TODO: Shall we use "pool true" to send newsletters etc?
    return nodemailer.createTransport(prodSmtp);
  }
}

function createMessage(
  from: MailFrom,
  toAddresses: string | string[],
  content: MailContent,
  replyTo?: string
) {
  // TODO: Sent mails are not saved. this is out of scope of nodemailer. Use node-imap instead?
  const isArray = Array.isArray(toAddresses);
  const to = isArray ? undefined : toAddresses;
  const bcc = isArray ? toAddresses : undefined;

  return {
    from,
    // TODO: Why are mails not received (or sent?) when "from" and "to" are identical?
    to,
    bcc,
    subject: content.title,
    text: content.text,
    replyTo,
    attachments: content.attachments,
  };
}

module.exports = sendMail;
export default sendMail;
