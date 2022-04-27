import { Response, RequestHandler, Request } from "express";

const Token = require("../db")["Token"]; // TODO: Delegate token access to the service tier
import jwt from "jsonwebtoken";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http-status-constants";
import userService from "../service/UserService";
require("../service/UserService");
import { JwtPayload } from "jsonwebtoken";

import logger from "../config/logger";
const config = require("../config/env-config").default;

interface AuthData extends JwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
}

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 */
const authToken: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(UNAUTHORIZED);

    jwt.verify(token, config.get("jwtLogin"), (error: any, user) => {
      if (error) {
        if (error.toString().includes("jwt expired")) {
          return res.status(UNAUTHORIZED).send("EXPIRED"); // See: https://stackoverflow.com/questions/45153773/correct-http-code-for-authentication-token-expiry-401-or-403
        }
        logger.warn(
          `Verify authentication for user ${user?.firstName} ${user?.lastName} failed: ` +
            error
        );
        return res.sendStatus(UNAUTHORIZED);
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates an access token around a provided user object. And stores the following user related data into the token:
 * - id
 * - fistname
 * - lastname
 * - role
 * - gender
 *
 * @param {Object} user The user object for which a token will be created.
 * @returns A access token.
 */
const createToken = (user: AuthData) => {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtLogin"), {
    expiresIn: "5s",
  });
  return token;
};

/**
 * Creates a refresh token around a provided user object.
 * The user will be stored directly into the refresh token to save a follow up call to the user table of the db when refreshing the access token.
 *
 * @param {Object} user The user object for which a token will be created.
 * @returns A refresh token.
 */
const createRefreshToken = (user: AuthData) => {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtRefresh"));
  Token.create({ token });
  return token;
};

/**
 * Deletes the refresh token of a user from the db and therefore logs a user out of the service (when his access token expires).
 *
 * @param {string} token The refresh token that should be deleted
 * @returns The amount of tokens that where deleted.
 */
const logoutToken = async (token: string) => {
  return Token.destroy({
    where: { token },
  });
};

/**
 * Creates a new access token for a user when the user provided a valid refresh token which is also already known (saved) by the database.
 * The new access token will again be populated by user related data like firstname, role, gender.
 *
 * @param {string} token The refresh token of an user.
 * @returns A new access token.
 */
const refreshToken = async (token: string) => {
  if (!token) return;

  const found = await Token.findOne({
    where: { token },
  });
  if (!found) return;
  return jwt.verify(token, config.get("jwtRefresh"), (error: any, user) => {
    if (error) {
      logger.warn(
        `Refresh authentication for user ${user.firstName} ${user.lastName} failed: `,
        error
      );
      return;
    }
    return createToken(user);
  });
};

/**
 * Checks if the provided id matches with the userId in the request token or if the requester has role "moderator".
 *
 * @param req The request that will be checked for the token and the embedded id.
 * @param res The response to the request. Will send FORBIDDEN if ids don't match.
 * @param {string} otherId The provided id which will be checked against.
 * @returns True if the ids are different. Otherwise false.
 */
const requesterIsNotOwner = async (
  req: Request,
  res: Response,
  otherId: string
) => {
  if (
    otherId !== req.user?.id &&
    !(await userService.isModerator(req.user?.id))
  ) {
    logger.debug("auth: requester is not owner");
    res.sendStatus(FORBIDDEN);
    return true;
  }
  return false;
};

/**
 * Checks if the the userId in the request token belongs to a user of role "administrator".
 *
 * @param req The request that will be checked for the token and the embedded id.
 * @param res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role administrator. Otherwise false.
 */
const requesterIsNotAdmin: RequestHandler = async (req, res) => {
  if (!(await userService.isAdmin(req.user?.id))) {
    logger.debug("auth: requester is not admin");
    return res.sendStatus(FORBIDDEN);
  }
};

/**
 * Checks if the the userId in the request token belongs to a user of role "moderator".
 *
 * @param req The request that will be checked for the token and the embedded id.
 * @param res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role moderator or higher. Otherwise false.
 */
const requesterIsNotModerator: RequestHandler = async (req, res) => {
  if (!(await userService.isModerator(req.user?.id))) {
    logger.debug("auth: requester is not moderator");
    return res.sendStatus(FORBIDDEN);
  }
};

function createUserTokenObject(user: AuthData) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    gender: user.gender,
  };
}

exports.createToken = createToken;
exports.createRefreshToken = createRefreshToken;
exports.authToken = authToken;
exports.refreshToken = refreshToken;
exports.logoutToken = logoutToken;
exports.requesterIsNotOwner = requesterIsNotOwner;
exports.requesterIsNotAdmin = requesterIsNotAdmin;
exports.requesterIsNotModerator = requesterIsNotModerator;

export {
  createToken,
  createRefreshToken,
  authToken,
  refreshToken,
  logoutToken,
  requesterIsNotOwner,
  requesterIsNotAdmin,
  requesterIsNotModerator,
};
