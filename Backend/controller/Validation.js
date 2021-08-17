const { check, validationResult } = require("express-validator");

function checkStringObjectNotEmpty(field) {
  return check(field)
    .not()
    .isEmpty()
    .withMessage(`${field} is requiered`)
    .trim()
    .escape();
}
function checkOptionalIsOnlyOfValue(field, arrayOfValidValues) {
  return check(field)
    .optional()
    .isIn(arrayOfValidValues)
    .withMessage(`Value in ${field} must fit one of ${arrayOfValidValues}`);
}
function checkOptionalIsBoolean(field) {
  return check(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean`);
}
function checkIsDateObject(field) {
  //Date Format like 2021-08-16
  return check(field)
    .isDate()
    .withMessage(`${field} must be a valid date format`);
}
function checkIsUuidObject(field) {
  return check(field)
    .isUUID()
    .withMessage(`${field} must be a valid uuid format`);
}

function checkIsEmail(field) {
  return check(field)
    .isEmail()
    .withMessage(`${field} must be a valid email format`);
}

function validationHasErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.checkIsDateObject = checkIsDateObject;
exports.checkIsEmail = checkIsEmail;
exports.checkOptionalIsBoolean = checkOptionalIsBoolean;
exports.checkOptionalIsOnlyOfValue = checkOptionalIsOnlyOfValue;
exports.checkStringObjectNotEmpty = checkStringObjectNotEmpty;
exports.validationHasErrors = validationHasErrors;
exports.checkIsUuidObject = checkIsUuidObject;
