const nodemailer = require("nodemailer");
const logger = require("./logger");

// TODO: Shall we use "pool true" to send newsletters etc?
const mailClient = nodemailer.createTransport({
  host: process.env.MAIL_SERVICE,
  secure: true,
  auth: {
    user: process.env.MAIL_SERVICE_USER,
    pass: process.env.MAIL_SERVICE_PASSWORD,
  },
});

/**
 * Sends an e-mail to a single recipent or multiple recipents.
 *
 * @param {string|Array} mailAddresses A single email address of type string oder multiple addresses as an array of strings.
 * @param {object} content A object containing a "title" and a "text" property of type string.
 * @param {string} [replyTo] The replyTo address which will be added to the send e-mail.
 * @returns Returns true if a mail was sucessfully delegated to the E-Mail Service Provider.
 */
const sendMail = async (mailAddresses, content, replyTo) => {
  if (
    !content.title ||
    !content.text ||
    content.title.length == 0 ||
    content.text.length == 0
  )
    throw "content.title and content.text are not allowed to be empty";

  const message = createMessage(
    {
      name: process.env.MAIL_SERVICE_FROM_NAME,
      address: process.env.MAIL_SERVICE_FROM_EMAIL,
    },
    mailAddresses,
    content,
    replyTo
  );
  try {
    const info = await mailClient.sendMail(message);
    logger.debug("E: Message sent: " + info.messageId);
  } catch (error) {
    // Message failed: 451 4.3.0 pymilter: untrapped exception in pythonfilter
    // This error indicates that the netcup mailservice doesn't allow to send mails from a different domain then the domain of the mail user account.
    logger.error("E: " + error);
  }

  return true;
};

function createMessage(from, toAddresses, content, replyTo) {
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
  };
}

module.exports = sendMail;
