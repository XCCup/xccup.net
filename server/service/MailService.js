const sendMail = require("../config/email");
const logger = require("../config/logger");
const {
  MAIL_MESSAGE_PREFIX,
  REGISTRATION_TEXT,
  REGISTRATION_TITLE,
  NEW_PASSWORD_TITLE,
  NEW_PASSWORD_TEXT,
  REQUEST_NEW_PASSWORD_TITLE,
  REQUEST_NEW_PASSWORD_TEXT,
  CONFIRM_NEW_ADDRESS_TITLE,
  CONFIRM_NEW_ADDRESS_TEXT,
} = require("../constants/email-message-constants");
const userService = require("./UserService");

const clientUrl = process.env.CLIENT_URL;
const userActivateLink = process.env.CLIENT_USER_ACTIVATE;
const userPasswordLostLink = process.env.CLIENT_USER_PASSWORD_LOST;
const confirmMailChangeLink = process.env.CLIENT_USER_MAIL_CHANGE;

const service = {
  sendMailSingle: async (fromUserId, toUserId, content) => {
    logger.debug(`${fromUserId} requested to send an email`);

    const usersData = await Promise.all([
      userService.getById(toUserId),
      userService.getById(fromUserId),
    ]);

    const isXccupOffical = usersData[0].role != "Keine";

    const toMail = usersData[0].email;
    const fromMail = usersData[1].email;
    const fromName = `${usersData[1].firstName} ${usersData[1].lastName}`;

    if (!isXccupOffical) {
      content.text = MAIL_MESSAGE_PREFIX(fromName) + content.text;
    }

    return await sendMail(toMail, content, fromMail);
  },

  sendActivationMail: async (user) => {
    logger.info(`Send activation mail to ${user.email}`);

    const activationLink = `${clientUrl}${userActivateLink}?userId=${user.id}&token=${user.token}`;

    const content = {
      title: REGISTRATION_TITLE,
      text: REGISTRATION_TEXT(user.firstName, activationLink),
    };

    return await sendMail(user.email, content);
  },

  sendNewPasswordMail: async (user, password) => {
    logger.info(`Send new password to ${user.email}`);

    const content = {
      title: NEW_PASSWORD_TITLE,
      text: NEW_PASSWORD_TEXT(user.firstName, password),
    };

    return await sendMail(user.email, content);
  },

  sendRequestNewPasswordMail: async (user) => {
    logger.info(`Send new password request to ${user.email}`);

    const resetLink = `${clientUrl}${userPasswordLostLink}?confirm=true&userId=${user.id}&token=${user.token}`;

    const content = {
      title: REQUEST_NEW_PASSWORD_TITLE,
      text: REQUEST_NEW_PASSWORD_TEXT(user.firstName, resetLink),
    };

    return await sendMail(user.email, content);
  },

  sendConfirmNewMailAddressMail: async (user, newEmail) => {
    logger.info(
      `Send confirm new mail for user ${user.firstName} ${user.lastName} to ${newEmail}`
    );

    const confirmMailLink = `${clientUrl}${confirmMailChangeLink}?userId=${user.id}&token=${user.token}&email=${newEmail}`;

    const content = {
      title: CONFIRM_NEW_ADDRESS_TITLE,
      text: CONFIRM_NEW_ADDRESS_TEXT(user.firstName, confirmMailLink),
    };

    return await sendMail(newEmail, content);
  },

  sendMailAll: async (fromUserId, isNewsletter, content) => {
    logger.info(`${fromUserId} requested to send an email to all users`);

    const mailAddresses = await userService.getAllEmail(isNewsletter);

    return await sendMail(mailAddresses, content);
  },
};

module.exports = service;
