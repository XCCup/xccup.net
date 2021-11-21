const mailClient = require("../config/email");
const logger = require("../config/logger");
const {
  MAIL_MESSAGE_PREFIX,
  REGISTRATION_TEXT,
} = require("../constants/email-message-constants");
const userService = require("./UserService");

const service = {
  sendMail: async (mailAddresses, content) => {
    const message = createMessage(
      process.env.MAIL_SERVICE_USER,
      mailAddresses,
      content
    );

    try {
      const info = await mailClient.sendMail(message);
      logger.debug("Message sent: ", info.messageId);
    } catch (error) {
      // Message failed: 451 4.3.0 pymilter: untrapped exception in pythonfilter
      // This error indicates that the netcup mailservice doesn't allow to send mails from a different domain then the domain of the mail user account.
      logger.error(error);
    }

    return true;
  },

  sendMailSingle: async (fromUserId, toUserId, content) => {
    logger.debug(`${fromUserId} requested to send an email`);

    const usersData = await Promise.all([
      userService.getById(toUserId),
      userService.getById(fromUserId),
    ]);

    const isXccupOffical = usersData[0].role != "Keine";

    const fromMail = usersData[0].email;
    const fromName = `${usersData[0].firstName} ${usersData[0].lastName}`;
    const toMail = usersData[1].email;

    if (!isXccupOffical) {
      content.text = MAIL_MESSAGE_PREFIX(fromName, fromMail) + content.text;
    }

    return await service.sendMail(toMail, content);
  },

  sendActivationMail: async (user) => {
    logger.info(`Send activation mail for ${user.id}`);

    const activationLink = `http://localhost:3000/users/activate/${user.id}`;

    const content = {
      title: "Deine Anmeldung",
      text: REGISTRATION_TEXT(user.firstName, activationLink),
    };

    return await service.sendMail(user.email, content);
  },

  sendMailAll: async (fromUserId, isNewsletter, content) => {
    logger.info(`${fromUserId} requested to send an email to all users`);

    const mailAddresses = await userService.getAllEmail(isNewsletter);

    return await service.sendMail(mailAddresses, content);
  },
};

function createMessage(from, to, content) {
  return {
    from,
    to,
    subject: content.title,
    text: content.text,
  };
}

module.exports = service;
