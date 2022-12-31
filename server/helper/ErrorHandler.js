const logger = require("../config/logger");

function handleSequelizeUniqueError(error, res) {
  if (error.name?.includes("SequelizeUniqueConstraintError")) {
    logger.warn(error.errors[0].message);
    return res.status(500).send("Internal Server Error");
  }
}

function handleXccupRestrictionError(error, res) {
  if (error.name?.includes("XccupRestrictionError")) {
    logger.warn(error);
    return res.status(403).send(error.message);
  }
}

function handleXccupHttpError(error, res) {
  if (error.name === "XccupHttpError") {
    logger.warn(error);
    return res
      .status(error.statusCode)
      .send(error.clientMessage ?? error.message);
  }
}

function handleGeneralError(error, req, res) {
  logger.error(error, {
    req: {
      originalUrl: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    },
  });
  res
    .status(500)
    .send(
      "There was an internal error! Please forward this message to an administrator. Time: " +
        new Date()
    );
}

class XccupRestrictionError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
    this.name = "XccupRestrictionError";
    this.message = message;
  }
}

class XccupHttpError extends Error {
  constructor(statusCode, message = "", clientMessage = "") {
    super(message);
    this.statusCode = statusCode;
    this.name = "XccupHttpError";
    this.message = message;
    this.clientMessage = clientMessage;
  }
}

function sanitizeRequestBeforeLogging(req) {
  if (Object.keys(req.body).length == 0) return;
  // Delete these params before logging because of security or size
  const blacklist = ["pw", "password", "pass", "token", "IGCigcIGC"];
  blacklist.forEach((e) => {
    if (req.body[e]) delete req.body[e];
  });
}

// Don't change the signatur of this function. Even when "next" is not used, if "next" is missing, express won't use this middleware.
// TODO: Find a more elegant solution for the "next" problem
// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  sanitizeRequestBeforeLogging(req);
  handleSequelizeUniqueError(err, res) ||
    handleXccupRestrictionError(err, res) ||
    handleXccupHttpError(err, res) ||
    handleGeneralError(err, req, res);
}

exports.handleError = handleError;
exports.XccupRestrictionError = XccupRestrictionError;
exports.XccupHttpError = XccupHttpError;
