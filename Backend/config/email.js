const nodemailer = require("nodemailer");
const logger = require("./logger");

const mailClient = nodemailer.createTransport({
  host: process.env.MAIL_SERVICE,
  port: process.env.MAIL_SERVICE_PORT,
  auth: {
    user: process.env.MAIL_SERVICE_USER,
    pass: process.env.MAIL_SERVICE_PASSWORD,
  },
});

/**
 *
 * @param {*} mailAddresses A single email address of type string oder multiple addresses as an array of strings.
 * @param {*} content A object containing a "title" and a "text" property of type string.
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
    process.env.MAIL_SERVICE_USER,
    mailAddresses,
    content,
    replyTo
  );

  try {
    const info = await mailClient.sendMail(message);
    logger.debug("Message sent: " + info.messageId);
  } catch (error) {
    // Message failed: 451 4.3.0 pymilter: untrapped exception in pythonfilter
    // This error indicates that the netcup mailservice doesn't allow to send mails from a different domain then the domain of the mail user account.
    logger.error(error);
  }

  return true;
};

function createMessage(from, to, content, replyTo) {
  return {
    from,
    bcc: to,
    subject: content.title,
    text: content.text,
    replyTo,
  };
}

module.exports = sendMail;
