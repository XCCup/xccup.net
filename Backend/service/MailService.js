const sendMail = require("../config/email");
const logger = require("../config/logger");
const {
  MAIL_MESSAGE_PREFIX,
  REGISTRATION_TEXT,
  REGISTRATION_TITLE,
} = require("../constants/email-message-constants");
const userService = require("./UserService");

const service = {
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

    return await sendMail(toMail, content);
  },

  sendActivationMail: async (user) => {
    logger.info(`Send activation mail for ${user.id}`);

    const activationLink = `http://localhost:3000/users/activate/${user.id}`;

    const content = {
      title: REGISTRATION_TITLE,
      text: REGISTRATION_TEXT(user.firstName, activationLink),
    };

    return await sendMail(user.email, content);
  },

  sendMailAll: async (fromUserId, isNewsletter, content) => {
    logger.info(`${fromUserId} requested to send an email to all users`);

    const mailAddresses = await userService.getAllEmail(isNewsletter);

    return await sendMail(mailAddresses, content);
  },
};

module.exports = service;
