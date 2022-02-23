const sendMail = require("../config/email");
const logger = require("../config/logger");
const config = require("../config/env-config");
const {
  MAIL_MESSAGE_PREFIX,
  REGISTRATION_TEXT,
  REGISTRATION_TITLE,
  NEW_PASSWORD_TITLE,
  NEW_PASSWORD_TEXT,
  REQUEST_NEW_PASSWORD_TITLE,
  REQUEST_NEW_PASSWORD_TEXT,
  CONFIRM_CHANGE_EMAIL_TITLE,
  NOTIFY_CHANGE_EMAIL_TEXT,
  NOTIFY_CHANGE_EMAIL_TITLE,
  CONFIRM_CHANGE_EMAIL_TEXT,
  AIRSPACE_VIOLATION_TITLE,
  AIRSPACE_VIOLATION_TEXT,
  NEW_FLIGHT_COMMENT_TITLE,
  NEW_FLIGHT_COMMENT_TEXT,
  ADDED_TO_TEAM_TITLE,
  ADDED_TO_TEAM_TEXT,
  NEW_FLIGHT_COMMENT_RESPONSE_TEXT,
} = require("../constants/email-message-constants");
const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const Comment = require("../config/postgres")["FlightComment"];

const clientUrl = config.get("clientUrl");
const userActivateLink = config.get("clientActivateProfil");
const userPasswordLostLink = config.get("clientPasswordLost");
const confirmMailChangeLink = config.get("clientConfirmEmail");
const flightLink = config.get("clientFlight");

const service = {
  sendMailSingle: async (fromUserId, toUserId, content) => {
    const [fromUser, toUser] = await Promise.all([
      User.findByPk(fromUserId),
      User.findByPk(toUserId),
    ]);

    logger.debug(`MS: ${fromUserId} requested to send an email`);

    const isXccupOffical = fromUserId.role != "Keine";

    const toMail = toUser.email;
    const fromMail = fromUser.email;
    const fromName = `${fromUser.firstName} ${fromUser.lastName}`;

    if (!isXccupOffical) {
      content.text = MAIL_MESSAGE_PREFIX(fromName) + content.text;
    }

    return sendMail(toMail, content, fromMail);
  },

  sendActivationMail: async (user) => {
    logger.info(`MS: Send activation mail to ${user.email}`);

    const activationLink = `${clientUrl}${userActivateLink}?userId=${user.id}&token=${user.token}`;

    const content = {
      title: REGISTRATION_TITLE,
      text: REGISTRATION_TEXT(user.firstName, activationLink),
    };

    return sendMail(user.email, content);
  },

  sendNewPasswordMail: async (user, password) => {
    logger.info(`MS: Send new password to ${user.email}`);

    const content = {
      title: NEW_PASSWORD_TITLE,
      text: NEW_PASSWORD_TEXT(user.firstName, password),
    };

    return sendMail(user.email, content);
  },

  sendRequestNewPasswordMail: async (user) => {
    logger.info(`MS: Send new password request to ${user.email}`);

    const resetLink = `${clientUrl}${userPasswordLostLink}?confirm=true&userId=${user.id}&token=${user.token}`;

    const content = {
      title: REQUEST_NEW_PASSWORD_TITLE,
      text: REQUEST_NEW_PASSWORD_TEXT(user.firstName, resetLink),
    };

    return sendMail(user.email, content);
  },

  sendConfirmChangeEmailAddressMail: async (user, newEmail) => {
    logger.info(
      `MS: Send confirm new email for user ${user.firstName} ${user.lastName} to ${newEmail}`
    );

    const confirmMailLink = `${clientUrl}${confirmMailChangeLink}?userId=${user.id}&token=${user.token}&email=${newEmail}`;

    const content = {
      title: CONFIRM_CHANGE_EMAIL_TITLE,
      text: CONFIRM_CHANGE_EMAIL_TEXT(
        user.firstName,
        confirmMailLink,
        newEmail
      ),
    };

    return sendMail(newEmail, content);
  },

  sendNewEmailAddressMailNotification: async (user, newEmail) => {
    logger.info(
      `MS: Send notificatione mail for user ${user.firstName} ${user.lastName} to ${user.email}`
    );

    const content = {
      title: NOTIFY_CHANGE_EMAIL_TITLE,
      text: NOTIFY_CHANGE_EMAIL_TEXT(user.firstName, newEmail),
    };

    return sendMail(user.email, content);
  },

  sendAirspaceViolationMail: async (flight) => {
    const user = await User.findByPk(flight.userId);

    logger.info(
      `MS: Send airspace violation mail to user ${user.firstName} ${user.lastName}`
    );

    const flightLinkUrl = `${clientUrl}${flightLink}/${flight.externalId}`;

    const content = {
      title: AIRSPACE_VIOLATION_TITLE,
      text: AIRSPACE_VIOLATION_TEXT(user.firstName, flightLinkUrl),
    };

    const adminMail = config.get("mailServiceFromEmail");
    const mailReceivers = [user.email, adminMail];

    return sendMail(mailReceivers, content);
  },

  sendAddedToTeamMail: async (teamName, memberIds) => {
    const users = await User.findAll({
      where: {
        id: memberIds,
      },
    });
    const userMails = users.map((u) => u.email);

    users.forEach((u) => {
      logger.info(`MS: Send "Added to team mail" to user ${u.id}`);
    });

    const content = {
      title: ADDED_TO_TEAM_TITLE,
      text: ADDED_TO_TEAM_TEXT(teamName),
    };

    return sendMail(userMails, content);
  },

  sendNewFlightCommentMail: async (comment) => {
    const queries = [
      User.findByPk(comment.userId),
      Flight.findByPk(comment.flightId),
    ];
    if (comment.relatedTo) {
      queries.push(Comment.findByPk(comment.relatedTo));
    }

    const [fromUser, flight, relatedComment] = await Promise.all(queries);

    const toUserId = relatedComment ? relatedComment.userId : flight.userId;

    // Don't sent any email if commenter is the same person as the owner of the flight
    if (comment.userId == toUserId) return;

    const toUser = await User.findByPk(toUserId);

    logger.info(`MS: Send new flight comment mail to user ${toUser.id}`);

    const flightLinkUrl = `${clientUrl}${flightLink}/${flight.externalId}`;

    const textFunction = relatedComment
      ? NEW_FLIGHT_COMMENT_RESPONSE_TEXT
      : NEW_FLIGHT_COMMENT_TEXT;

    const content = {
      title: NEW_FLIGHT_COMMENT_TITLE,
      text: textFunction(
        toUser.firstName,
        `${fromUser.firstName} ${fromUser.lastName} `,
        comment.message,
        flightLinkUrl
      ),
    };

    return sendMail(toUser.email, content);
  },

  sendMailAll: async (user, content) => {
    logger.info(`MS: ${user.id} requested to send an email to all users`);

    const query = {
      attributes: ["email"],
      where: {
        emailNewsletter: true,
      },
    };

    const mailAddresses = await User.findAll(query);

    return sendMail(mailAddresses, content);
  },
};

module.exports = service;
