const jwt = require("jsonwebtoken");
const {
  UNAUTHORIZED,
  FORBIDDEN,
} = require("../constants/http-status-constants");
const userService = require("../service/UserService");
require("../service/UserService");
const Token = require("../config/postgres")["Token"];
const logger = require("../config/logger");

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 * @returns Nothing.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(UNAUTHORIZED);

    jwt.verify(token, process.env.JWT_LOGIN_TOKEN, (error, user) => {
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
 * Creates a access token around a provided userId.
 * @param {*} userId The id of the user for which the token is created.
 * @returns A access token.
 */
const create = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    process.env.JWT_LOGIN_TOKEN,
    {
      expiresIn: "200s",
    }
  );
  return token;
};

const createRefresh = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    process.env.JWT_REFRESH_TOKEN
  );
  Token.create({ token });
  return token;
};

const logout = async (token) => {
  return Token.destroy({
    where: { token },
  });
};

const refresh = async (token) => {
  if (!token) return;

  const found = await Token.findOne({
    where: { token },
  });
  if (!found) return;
  return await jwt.verify(
    token,
    process.env.JWT_REFRESH_TOKEN,
    (error, user) => {
      if (error) {
        logger.warn(
          `Refresh authentication for user ${user.firstName} ${user.lastName} failed: `,
          error
        );
        return;
      }
      return create(user);
    }
  );
};

/**
 * Checks if the provided id matches with the userId in the request token or if the requester has role "moderator".
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

exports.createToken = create;
exports.createRefreshToken = createRefresh;
exports.authToken = auth;
exports.refreshToken = refresh;
exports.logoutToken = logout;
exports.requesterIsNotOwner = requesterIsNotOwner;
exports.requesterIsNotAdmin = requesterIsNotAdmin;
exports.requesterIsNotModerator = requesterIsNotModerator;
