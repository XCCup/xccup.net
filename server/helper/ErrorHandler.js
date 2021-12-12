const logger = require("../config/logger");

function handleSequelizeUniqueError(error, req, res) {
  if (error.name?.includes("SequelizeUniqueConstraintError")) {
    logger.warn(error.errors[0].message, createMetaDataFromReq(req));
    return res.status(500).send('Internal Server Error'); //Do not return internal errors to the client
  }
}

function handleXccupRestrictionError(error, req, res) {
  if (error.name?.includes("XccupRestrictionError")) {
    logger.error(error, createMetaDataFromReq(req));
    return res.status(403).send(error.message);
  }
}

function handleXccupHttpError(error, req, res) {
  if (error.name === 'XccupHttpError') {
    logger.error(error, createMetaDataFromReq(req));
    return res.status(error.statusCode).send(error.clientMessage); //do not expose error messages in general to the client!
  }
}

function handleGeneralError(error, req, res) {
  logger.error(error, {
    meta: {
      req,
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

function createMetaDataFromReq(req) {
  return Object.keys(req.body).length > 0
    ? {
      meta: {
        body: req.body,
      },
    }
    : undefined;
}

function handleError(err, req, res) {
  handleSequelizeUniqueError(err, req, res)
    || handleXccupRestrictionError(err, req, res)
    || handleXccupHttpError(err, req, res)
    || handleGeneralError(err, req, res);
}

exports.handleError = handleError;
exports.XccupRestrictionError = XccupRestrictionError;
exports.XccupHttpError = XccupHttpError;
