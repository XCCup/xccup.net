import { UserAttributes } from "../db/models/User";
import db from "../db"; // TODO: Delegate token access to the service tier
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http-status-constants";
import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
const userService = require("../service/UserService");
const logger = require("../config/logger");
const config = require("../config/env-config").default;

interface TokenUserObject {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
}

enum AuthTokenStatus {
  NO_AUTH = "NO_AUTH",
  EXPIRED = "EXPIRED",
  INVALID = "INVALID",
}

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 */
export function authToken(req: Request, res: Response, next: CallableFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log("++++++++NO AUTH++++++++");
    if (!token) return res.sendStatus(UNAUTHORIZED);
    // if (!token) {
    //   req.authStatus = AuthTokenStatus.NO_AUTH;
    //   next();
    //   return;
    // }

    jwt.verify(
      token,
      config.get("jwtLogin"),
      (error: Error, user: TokenUserObject) => {
        if (error) {
          if (error.toString().includes("jwt expired")) {
            // See: https://stackoverflow.com/questions/45153773/correct-http-code-for-authentication-token-expiry-401-or-403
            // console.log("++++++++EXPIRED++++++++");
            return res.status(UNAUTHORIZED).send("EXPIRED");
          }
          logger.warn(
            `Verify authentication for user ${user?.firstName} ${user?.lastName} failed: ` +
              error
          );
          // console.log("++++++++UNAUTHORIZED++++++++");
          return res.sendStatus(UNAUTHORIZED);
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Creates an access token around a provided user object. And stores the following user related data into the token:
 * - id
 * - firstName
 * - lastname
 * - role
 * - gender
 *
 * @param {Object} user The user object for which a token will be created.
 * @returns A access token.
 */
export function createToken(user: Required<UserAttributes> | TokenUserObject) {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtLogin"), {
    expiresIn: "50s",
  });
  return token;
}

/**
 * Creates a refresh token around a provided user object.
 * The user will be stored directly into the refresh token to save a follow up call to the user table of the db when refreshing the access token.
 *
 * @param {Object} user The user object for which a token will be created.
 * @returns A refresh token.
 */
export function createRefreshToken(
  user: Required<UserAttributes> | TokenUserObject
) {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtRefresh"));
  db.Token.create({ token });
  return token;
}

/**
 * Deletes the refresh token of a user from the db and therefore logs a user out of the service (when his access token expires).
 *
 * @param {Object} token The refresh token that should be deleted
 * @returns The amount of tokens that where deleted.
 */
export function logoutToken(token: string) {
  return db.Token.destroy({
    where: { token },
  });
}

/**
 * Creates a new access token for a user when the user provided a valid refresh token which is also already known (saved) by the database.
 * The new access token will again be populated by user related data like firstname, role, gender.
 *
 * @param {Object} token The refresh token of an user.
 * @returns A new access token.
 */
export async function refreshToken(token: string) {
  if (!token) return;

  const found = await db.Token.findOne({
    where: { token },
  });
  if (!found) return;
  return jwt.verify(
    token,
    config.get("jwtRefresh"),
    (error: Error, user: TokenUserObject) => {
      if (error) {
        logger.warn(
          `Refresh authentication for user ${user.firstName} ${user.lastName} failed: `,
          error
        );
        return;
      }
      return createToken(user);
    }
  );
}

/**
 * Checks if the provided id matches with the userId in the request token or if the requester has role "moderator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @param {*} otherId The provided id which will be checked against.
 * @returns True if the ids are different. Otherwise false.
 */
export async function requesterIsNotOwner(
  req: Express.Request,
  res: Response,
  otherId: string
) {
  if (
    otherId !== req.user?.id &&
    !(await userService.isModerator(req.user?.id))
  ) {
    logger.debug("auth: requester is not owner");
    res.sendStatus(FORBIDDEN);
    return true;
  }
  return false;
}

/**
 * Checks if the the userId in the request token belongs to a user of role "administrator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role administrator. Otherwise false.
 */
export async function requesterIsNotAdmin(req: Express.Request, res: Response) {
  if (!(await userService.isAdmin(req.user?.id))) {
    logger.debug("auth: requester is not admin");
    return res.sendStatus(FORBIDDEN);
  }
}

/**
 * Checks if the the userId in the request token belongs to a user of role "moderator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role moderator or higher. Otherwise false.
 */
export async function requesterIsNotModerator(
  req: Express.Request,
  res: Response
) {
  if (!(await userService.isModerator(req.user?.id))) {
    logger.debug("auth: requester is not moderator");
    return res.sendStatus(FORBIDDEN);
  }
}

function createUserTokenObject(
  user: Required<UserAttributes> | TokenUserObject
): TokenUserObject {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    gender: user.gender,
  };
}
