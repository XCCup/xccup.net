function handleSequelizeUniqueError(error, res) {
  if (error.name?.includes("SequelizeUniqueConstraintError"))
    return res.status(403).send(error.errors[0].message);
}

function handleXccupRestrictionError(error, res) {
  if (error.name?.includes("XccupRestrictionError"))
    return res.status(403).send(error.message);
}

function handleGeneralError(error, res) {
  console.error(error.stack);
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

exports.handleSequelizeUniqueError = handleSequelizeUniqueError;
exports.handleGeneralError = handleGeneralError;
exports.handleXccupRestrictionError = handleXccupRestrictionError;
exports.XccupRestrictionError = XccupRestrictionError;
