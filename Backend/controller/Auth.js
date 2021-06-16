const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { UNAUTHORIZED, FORBIDDEN } = require("./Constants");
const Token = require("../model/Token");

/**
 * Needs to be run on server start up to initialize the encryption tokens.
 */
const init = () => {
  process.env.JWT_LOGIN_TOKEN = crypto.randomBytes(64).toString("hex");
  process.env.JWT_REFRESH_TOKEN = crypto.randomBytes(64).toString("hex");
  //TODO Remove after development
  console.log("L: ", process.env.JWT_LOGIN_TOKEN);
  console.log("R: ", process.env.JWT_REFRESH_TOKEN);
  //After restart all stored tokens will become invalid. Therefore all stored tokens will be deleted.
  Token.destroy({ truncate: true });
};

/**
 * The authentication middleware for the request. If any error within authentication happens the request will be terminated here.
 * @returns Nothing.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(token, process.env.JWT_LOGIN_TOKEN, (error, user) => {
    if (error) {
      if (error.toString().includes("jwt expired")) {
        return res.status(FORBIDDEN).send("EXPIRED");
      }
      console.log("Verify err: ", error);
      return res.sendStatus(FORBIDDEN);
    }
    req.user = user;
    next();
  });
};

/**
 * Creates a access token around a provided userId.
 * @param {*} userId The id of the user for which the token is created.
 * @returns A access token.
 */
const create = (userId, username) => {
  const token = jwt.sign(
    { id: userId, username: username },
    process.env.JWT_LOGIN_TOKEN,
    {
      expiresIn: "20s",
    }
  );
  return token;
};

const createRefresh = (userId, username) => {
  const token = jwt.sign(
    { id: userId, username: username },
    process.env.JWT_REFRESH_TOKEN
  );
  Token.create({ token: token });
  return token;
};

const logout = async (token) => {
  return await Token.destroy({
    where: { token: token },
  });
};

const refresh = async (token) => {
  if (!token) return;

  const found = await Token.findOne({
    where: { token: token },
  });
  if (!found) return;
  return await jwt.verify(
    token,
    process.env.JWT_REFRESH_TOKEN,
    (error, user) => {
      if (error) {
        console.log("Verify err: ", error);
        return;
      }
      return create(user.id, user.username);
    }
  );
};

/**
 * Checks if the provided id matches with the id in the request token.
 * @param {*} req The request that will be checked for the token and the embedded id.
 * @param {*} res The response to the request. Will send FORBIDDEN if ids don't match.
 * @param {*} otherId The provided id which will be checked against.
 * @returns True if the ids are different. Otherwise false.
 */
const belongsNotToId = (req, res, otherId) => {
  if (otherId !== req.user.id) {
    res.sendStatus(FORBIDDEN);
    return true;
  }
  return false;
};

exports.initAuth = init;
exports.authToken = auth;
exports.createToken = create;
exports.createRefreshToken = createRefresh;
exports.refreshToken = refresh;
exports.belongsNotToId = belongsNotToId;
exports.logoutToken = logout;
