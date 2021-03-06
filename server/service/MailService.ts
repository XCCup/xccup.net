import sendMail from "../config/email";
import logger from "../config/logger";
import config from "../config/env-config";

import {
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
  AIRSPACE_VIOLATION_ACCEPTED_TEXT,
  AIRSPACE_VIOLATION_ACCEPTED_TITLE,
  NEW_ADMIN_TASK_TITLE,
  NEW_ADMIN_TASK_TEXT,
  NEW_AIRSPACE_VIOLATION_TITLE,
  NEW_AIRSPACE_VIOLATION_TEXT,
  NEW_G_CHECK_INVALID_TITLE,
  NEW_G_CHECK_INVALID_TEXT,
} from "../constants/email-message-constants";

import db from "../db";
import type { UserAttributes, UserInstance } from "../db/models/User";
import type {
  FlightInstance,
  FlightOutputAttributes,
} from "../db/models/Flight";
import type { Comment } from "../types/Comment";
import { FlightCommentInstance } from "../db/models/FlightComment";

const clientUrl = config.get("clientUrl");
const userActivateLink = config.get("clientActivateProfil");
const userPasswordLostLink = config.get("clientPasswordLost");
const confirmMailChangeLink = config.get("clientConfirmEmail");
const flightLink = config.get("clientFlight");

interface MailContent {
  title: string;
  text: string;
}

const service = {
  sendMailSingle: async (
    fromUserId: string,
    toUserId: string,
    content: MailContent
  ) => {
    const [fromUser, toUser] = await Promise.all([
      db.User.findByPk(fromUserId),
      db.User.findByPk(toUserId),
    ]);

    logger.debug(`MS: ${fromUserId} requested to send an email`);

    const isXccupOffical = fromUser?.role != "Keine";
    const toMail = toUser?.email;
    const fromMail = fromUser?.email;
    const fromName = `${fromUser?.firstName} ${fromUser?.lastName}`;

    if (!toMail) return;
    if (!isXccupOffical) {
      content.text = MAIL_MESSAGE_PREFIX(fromName) + content.text;
    }

    return sendMail(toMail, content, fromMail);
  },

  sendActivationMail: async (user: UserAttributes) => {
    logger.info(`MS: Send activation mail to ${user.email}`);

    const activationLink = `${clientUrl}${userActivateLink}?userId=${user.id}&token=${user.token}`;

    const content = {
      title: REGISTRATION_TITLE,
      text: REGISTRATION_TEXT(user.firstName, activationLink),
    };

    return sendMail(user.email, content);
  },

  sendNewPasswordMail: async (user: UserAttributes, password: string) => {
    logger.info(`MS: Send new password to ${user.email}`);

    const content = {
      title: NEW_PASSWORD_TITLE,
      text: NEW_PASSWORD_TEXT(user.firstName, password),
    };

    return sendMail(user.email, content);
  },

  sendRequestNewPasswordMail: async (user: UserAttributes) => {
    logger.info(`MS: Send new password request to ${user.email}`);

    const resetLink = `${clientUrl}${userPasswordLostLink}?confirm=true&userId=${user.id}&token=${user.token}`;

    const content = {
      title: REQUEST_NEW_PASSWORD_TITLE,
      text: REQUEST_NEW_PASSWORD_TEXT(user.firstName, resetLink),
    };

    return sendMail(user.email, content);
  },

  sendConfirmChangeEmailAddressMail: async (
    user: UserAttributes,
    newEmail: string
  ) => {
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

  sendNewEmailAddressMailNotification: async (
    user: UserAttributes,
    newEmail: string
  ) => {
    logger.info(
      `MS: Send notificatione mail for user ${user.firstName} ${user.lastName} to ${user.email}`
    );

    const content = {
      title: NOTIFY_CHANGE_EMAIL_TITLE,
      text: NOTIFY_CHANGE_EMAIL_TEXT(user.firstName, newEmail),
    };

    return sendMail(user.email, content);
  },

  sendNewAdminTask: async () => {
    logger.info(`MS: Send new admin task mail`);

    if (config.get("env") !== "production") return;

    const content = {
      title: NEW_ADMIN_TASK_TITLE,
      text: NEW_ADMIN_TASK_TEXT,
    };

    const adminMail = config.get("mailServiceFromEmail");

    return sendMail(adminMail, content);
  },

  sendAirspaceViolationAdminMail: async (
    userId: string,
    flight: FlightOutputAttributes
  ) => {
    logger.info(`MS: Send airspace violation mail with igc to admins`);
    if (!userId || !flight.igcPath) return;
    const user = await db.User.findByPk(userId);

    if (!user) return;

    const content = {
      title: NEW_AIRSPACE_VIOLATION_TITLE,
      text: NEW_AIRSPACE_VIOLATION_TEXT(
        flight.externalId,
        user.firstName,
        user.lastName
      ),
      attachments: [{ path: flight.igcPath }],
    };

    const adminMail = config.get("mailServiceFromEmail");

    return sendMail(adminMail, content);
  },

  sendGCheckInvalidAdminMail: async (userId: string, igcPath: string) => {
    logger.info(`MS: Send G-Check violation mail with igc to admins`);
    if (!userId) return;
    const user = await db.User.findByPk(userId);

    if (!user) return;

    const content = {
      title: NEW_G_CHECK_INVALID_TITLE,
      text: NEW_G_CHECK_INVALID_TEXT(user.firstName, user.lastName),
      attachments: [{ path: igcPath }],
    };

    const adminMail = config.get("mailServiceFromEmail");

    return sendMail(adminMail, content);
  },

  sendAirspaceViolationMail: async (flight: FlightOutputAttributes) => {
    const user = await db.User.findByPk(flight.userId);
    if (!user) {
      logger.error(
        `MS: Send violation mail failed because user with ID ${flight.userId} wasn't found`
      );
      return;
    }

    logger.info(
      `MS: Send airspace violation mail for flight ${flight.externalId}`
    );

    const flightLinkUrl = `${clientUrl}${flightLink}/${flight.externalId}`;

    const content = {
      title: AIRSPACE_VIOLATION_TITLE,
      text: AIRSPACE_VIOLATION_TEXT(user.firstName, flightLinkUrl),
    };

    return sendMail(user.email, content);
  },

  sendAirspaceViolationAcceptedMail: async (flight: FlightOutputAttributes) => {
    const user = await db.User.findByPk(flight.userId);
    if (!user) {
      logger.error(
        `MS: Send violation accpted mail failed because user with ID ${flight.userId} wasn't found`
      );
      return;
    }

    logger.info(
      `MS: Send airspace violation accepted mail for flight ${flight.externalId}`
    );

    const flightLinkUrl = `${clientUrl}${flightLink}/${flight.externalId}`;

    const content = {
      title: AIRSPACE_VIOLATION_ACCEPTED_TITLE,
      text: AIRSPACE_VIOLATION_ACCEPTED_TEXT(user.firstName, flightLinkUrl),
    };

    return sendMail(user.email, content);
  },

  sendAddedToTeamMail: async (teamName: string, memberIds: string[]) => {
    const users = await db.User.findAll({
      where: {
        id: memberIds,
      },
    });
    const userMails = users.map((u: UserAttributes) => u.email);

    users.forEach((u) => {
      logger.info(`MS: Send "Added to team mail" to user ${u.id}`);
    });

    const content = {
      title: ADDED_TO_TEAM_TITLE,
      text: ADDED_TO_TEAM_TEXT(teamName),
    };

    return sendMail(userMails, content);
  },

  sendNewFlightCommentMail: async (comment: Comment) => {
    const queries: [
      Promise<UserInstance | null>,
      Promise<FlightInstance | null>,
      Promise<FlightCommentInstance | null>?
    ] = [
      db.User.findByPk(comment.userId),
      db.Flight.findByPk(comment.flightId),
    ];
    if (comment.relatedTo) {
      queries.push(db.FlightComment.findByPk(comment.relatedTo));
    }

    const [fromUser, flight, relatedComment] = await Promise.all(queries);

    if (!flight) return;

    // @ts-ignore
    const flightOwnerId = flight.userId;
    // @ts-ignore
    const replyCommentOwnerId = relatedComment ? relatedComment.userId : null;

    // Only send reply email if author isn't owner of the reply comment
    if (replyCommentOwnerId && replyCommentOwnerId != comment.userId) {
      sendCommentMail(
        replyCommentOwnerId,
        flight.externalId ?? 0,
        <UserAttributes>fromUser,
        comment,
        true
      );
    }

    // Only send email if author isn't owner of the flight
    if (flightOwnerId != comment.userId) {
      sendCommentMail(
        flightOwnerId,
        flight.externalId ?? 0,
        <UserAttributes>fromUser,
        comment,
        false
      );
    }
  },

  sendMailAll: async (userId: string, content: MailContent) => {
    logger.info(`MS: ${userId} requested to send an email to all users`);

    const query = {
      attributes: ["email"],
      where: {
        emailNewsletter: true,
      },
    };

    const mailAddresses = await db.User.findAll(query);

    return sendMail(mailAddresses, content);
  },
};

async function sendCommentMail(
  toUserId: string,
  flightId: number,
  fromUser: UserAttributes,
  comment: Comment,
  isRelatedComment: boolean
) {
  const toUser = await db.User.findByPk(toUserId);
  if (!toUser) {
    logger.error(
      `MS: Send new flight comment mail failed because user with ID ${toUserId} wasn't found`
    );
    return;
  }

  logger.info(`MS: Send new flight comment mail to user ${toUserId}`);

  const flightLinkUrl = `${clientUrl}${flightLink}/${flightId}`;

  const textFunction = isRelatedComment
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
}

module.exports = service;
export default service;
