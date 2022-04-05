const jwt = require("jsonwebtoken");
const {
  UNAUTHORIZED,
  FORBIDDEN,
} = require("../constants/http-status-constants");
const userService = require("../service/UserService");
require("../service/UserService");
const Token = require("../config/postgres")["Token"];
const logger = require("../config/logger");
const config = require("../config/env-config");

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(UNAUTHORIZED);

    jwt.verify(token, config.get("jwtLogin"), (error, user) => {
      if (error) {
        if (error.toString().includes("jwt expired")) {
          return res.status(FORBIDDEN).send("EXPIRED");
        }
        logger.warn(
          `Verify authentication for user ${user?.firstName} ${user?.lastName} failed: ` +
            error
        );
        return res.sendStatus(FORBIDDEN);
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
const create = (user) => {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtLogin"), {
    expiresIn: "200s",
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
const createRefresh = (user) => {
  const token = jwt.sign(createUserTokenObject(user), config.get("jwtRefresh"));
  Token.create({ token });
  return token;
};

/**
 * Deletes the refresh token of a user from the db and therefore logs a user out of the service (when his access token expires).
 *
 * @param {Object} token The refresh token that should be deleted
 * @returns The amount of tokens that where deleted.
 */
const logout = async (token) => {
  return Token.destroy({
    where: { token },
  });
};

/**
 * Creates a new access token for a user when the user provided a valid refresh token which is also already known (saved) by the database.
 * The new access token will again be populated by user related data like firstname, role, gender.
 *
 * @param {Object} token The refresh token of an user.
 * @returns A new access token.
 */
const refresh = async (token) => {
  if (!token) return;

  const found = await Token.findOne({
    where: { token },
  });
  if (!found) return;
  return jwt.verify(token, config.get("jwtRefresh"), (error, user) => {
    if (error) {
      logger.warn(
        `Refresh authentication for user ${user.firstName} ${user.lastName} failed: `,
        error
      );
      return;
    }
    return create(user);
  });
};

/**
 * Checks if the provided id matches with the userId in the request token or if the requester has role "moderator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @param {*} otherId The provided id which will be checked against.
 * @returns True if the ids are different. Otherwise false.
 */
const requesterIsNotOwner = async (req, res, otherId) => {
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
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role administrator. Otherwise false.
 */
const requesterIsNotAdmin = async (req, res) => {
  if (!(await userService.isAdmin(req.user?.id))) {
    logger.debug("auth: requester is not admin");
    return res.sendStatus(FORBIDDEN);
  }
};

/**
 * Checks if the the userId in the request token belongs to a user of role "moderator".
 *
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @returns True if requester has role moderator or higher. Otherwise false.
 */
const requesterIsNotModerator = async (req, res) => {
  if (!(await userService.isModerator(req.user?.id))) {
    logger.debug("auth: requester is not moderator");
    return res.sendStatus(FORBIDDEN);
  }
};

function createUserTokenObject(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    gender: user.gender,
  };
}

exports.createToken = create;
exports.createRefreshToken = createRefresh;
exports.authToken = auth;
exports.refreshToken = refresh;
exports.logoutToken = logout;
exports.requesterIsNotOwner = requesterIsNotOwner;
exports.requesterIsNotAdmin = requesterIsNotAdmin;
exports.requesterIsNotModerator = requesterIsNotModerator;
