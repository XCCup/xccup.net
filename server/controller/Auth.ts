import { UserAttributes } from "../db/models/User";
import db from "../db"; // TODO: Delegate token access to the service tier
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http-status-constants";
import { Request, Response } from "express";
import { ROLE } from "../constants/user-constants";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";
import config from "../config/env-config";

interface TokenUserObject extends JwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
}

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 */
export async function authToken(
  req: Request,
  res: Response,
  next: CallableFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      req.authStatus = "NO_AUTH";
      next();
      return;
    }

    jwt.verify(token, config.get("jwtLogin"), (error, data) => {
      const user = data as TokenUserObject;
      if (error) {
        if (error.toString().includes("jwt expired")) {
          // See: https://stackoverflow.com/questions/45153773/correct-http-code-for-authentication-token-expiry-401-or-403
          return res.status(UNAUTHORIZED).send("EXPIRED");
        }
        logger.warn(
          `Verify authentication for user ${user?.firstName} ${user?.lastName} failed: ` +
            error
        );
        return res.sendStatus(UNAUTHORIZED);
      }
      req.user = user;
      req.authStatus = "VALID";

      next();
    });
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
 * @returns A access token.
 */
export function createToken(
  user: Required<UserAttributes> | TokenUserObject
): string {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtLogin"), {
    expiresIn: "50s",
  });
  return token;
}

/**
 * Creates a refresh token around a provided user object.
 * The user will be stored directly into the refresh token to save a follow up call to the user table of the db when refreshing the access token.
 *
 * @returns A refresh token.
 */
export function createRefreshToken(
  user: Required<UserAttributes> | TokenUserObject
): string {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtRefresh"));
  db.Token.create({ token });
  return token;
}

/**
 * Deletes the refresh token of a user from the db and therefore logs a user out of the service (when his access token expires).
 *
 * @param {Object} token The refresh token that should be deleted
 * @returns The amount of tokens that where deleted. (Promise)
 */
export async function logoutToken(token: string): Promise<number> {
  return await db.Token.destroy({
    where: { token },
  });
}

/**
 * Creates a new access token for a user when the user provided a valid refresh token which is also already known (saved) by the database.
 * The new access token will again be populated by user related data like firstname, role, gender.
 *
 * @param {Object} token The refresh token of an user.
 * @returns A new access token (Promise!) or undefined.
 */
export async function refreshToken(token: string) {
  if (!token) return;

  const found = await db.Token.update(
    {
      lastRefresh: new Date(),
    },
    {
      where: { token },
    }
  );
  if (!found) {
    logger.debug("A: Unknown refresh token used");
    return;
  }

  return jwt.verify(token, config.get("jwtRefresh"), (error, data) => {
    const user = data as TokenUserObject;
    if (error) {
      logger.warn(
        `A: Refresh authentication for user ${user.firstName} ${user.lastName} failed: `,
        error
      );
      return;
    }
    return createToken(user);
  });
}

/**
 * Checks if the provided id matches with the userId in the request token or if the requester has role "moderator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @param {string} otherId The provided id which will be checked against.
 * @returns True if the ids are different. Otherwise false.
 */
export function requesterIsNotOwner(
  req: Request,
  res: Response,
  otherId?: string
): boolean {
  if (otherId !== req.user?.id && !userHasElevatedRole(req.user)) {
    logger.debug("auth: requester is not owner");
    res.sendStatus(FORBIDDEN);
    return true;
  }
  return false;
}

/**
 * Checks if the the userId in the request token belongs to a user of role "administrator".
 */
export function requesterMustBeAdmin(
  req: Request,
  res: Response,
  next: CallableFunction
) {
  if (!(req.user?.role == ROLE.ADMIN)) {
    logger.debug("auth: requester is not admin");
    return res.sendStatus(FORBIDDEN);
  }
  next();
}

/**
 * Checks if the the userId in the request token belongs to a user of role "moderator".
 */
export function requesterMustBeModerator(
  req: Request,
  res: Response,
  next: CallableFunction
) {
  if (!userHasElevatedRole(req.user)) {
    logger.debug("auth: requester is not moderator");
    return res.sendStatus(FORBIDDEN);
  }
  next();
}

export function requesterMustBeLoggedIn(
  req: Request,
  res: Response,
  next: CallableFunction
) {
  if (req.authStatus == "NO_AUTH") {
    logger.debug("auth: requester is not logged in");
    return res.sendStatus(FORBIDDEN);
  }
  next();
}

export function userHasElevatedRole(user: TokenUserObject | undefined) {
  return user?.role == ROLE.MODERATOR || user?.role == ROLE.ADMIN;
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
