const logger = require("../config/logger");

function handleSequelizeUniqueError(error, req, res) {
  if (error.name?.includes("SequelizeUniqueConstraintError")) {
    logger.warn(error.errors[0].message, createMetaDataFromReq(req));
    return res.status(403).send(error.errors[0].message);
  }
}

function handleXccupRestrictionError(error, req, res) {
  if (error.name?.includes("XccupRestrictionError")) {
    logger.error(error, createMetaDataFromReq(req));
    return res.status(403).send(error.message);
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

function createMetaDataFromReq(req) {
  return Object.keys(req.body).length > 0
    ? {
        meta: {
          body: req.body,
        },
      }
    : undefined;
}

exports.handleSequelizeUniqueError = handleSequelizeUniqueError;
exports.handleGeneralError = handleGeneralError;
exports.handleXccupRestrictionError = handleXccupRestrictionError;
exports.XccupRestrictionError = XccupRestrictionError;
