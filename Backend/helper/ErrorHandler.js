function handleSequelizeUniqueError(error, res, next) {
  if (error.name.includes("SequelizeUniqueConstraintError"))
    return res.status(403).send(error.errors[0].message);
  next(error, res);
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

exports.handleSequelizeUniqueError = handleSequelizeUniqueError;
exports.handleGeneralError = handleGeneralError;
