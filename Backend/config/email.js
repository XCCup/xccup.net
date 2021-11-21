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

const sendMail = async (mailAddresses, content) => {
  const message = createMessage(
    process.env.MAIL_SERVICE_USER,
    mailAddresses,
    content
  );

  try {
    const info = await mailClient.sendMail(message);
    logger.debug("Message sent: ", info);
  } catch (error) {
    // Message failed: 451 4.3.0 pymilter: untrapped exception in pythonfilter
    // This error indicates that the netcup mailservice doesn't allow to send mails from a different domain then the domain of the mail user account.
    logger.error(error);
  }

  return true;
};

function createMessage(from, to, content) {
  return {
    from,
    to,
    subject: content.title,
    text: content.text,
  };
}

module.exports = sendMail;
