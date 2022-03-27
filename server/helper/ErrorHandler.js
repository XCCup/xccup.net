const logger = require("../config/logger").default;

function handleSequelizeUniqueError(error, req, res) {
  if (error.name?.includes("SequelizeUniqueConstraintError")) {
    logger.warn(error.errors[0].message, createMetaDataFromReq(req));
    return res.status(500).send("Internal Server Error"); //Do not return internal errors to the client
  }
}

function handleXccupRestrictionError(error, req, res) {
  if (error.name?.includes("XccupRestrictionError")) {
    logger.warn(error, createMetaDataFromReq(req));
    return res.status(403).send(error.message);
  }
}

function handleXccupHttpError(error, req, res) {
  if (error.name === "XccupHttpError") {
    logger.warn(error, createMetaDataFromReq(req));
    return res.status(error.statusCode).send(error.clientMessage); //do not expose error messages in general to the client!
  }
}

function handleGeneralError(error, req, res) {
  logger.error(error, {
    req: {
      originalUrl: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body.igc ? { name: req.body.igc.name } : req.body,
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
  if (Object.keys(req.body).length == 0) return;

  // Prevent storage of whole igc file in error log
  if (req?.body?.igc?.body) delete req.body.igc.body;

  return {
    meta: {
      body: req.body,
    },
  };
}

// Don't change the signatur of this function. Even when "next" is not used, if "next" is missing, express won't use this middleware.
// TODO: Find a more elegant solution for the "next" problem
// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  handleSequelizeUniqueError(err, req, res) ||
    handleXccupRestrictionError(err, req, res) ||
    handleXccupHttpError(err, req, res) ||
    handleGeneralError(err, req, res);
}

exports.handleError = handleError;
exports.XccupRestrictionError = XccupRestrictionError;
exports.XccupHttpError = XccupHttpError;
