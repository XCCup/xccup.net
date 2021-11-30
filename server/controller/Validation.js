const { check, param, query, validationResult } = require("express-validator");

/**
 * Checks if the field is a string. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkStringObject(field) {
  return check(field).trim().escape();
}
/**
 * Checks if the field is a string and not empty. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkStringObjectNotEmpty(field) {
  return check(field)
    .not()
    .isEmpty()
    .withMessage(`${field} is required`)
    .trim()
    .escape();
}
/**
 * Checks if the field is a "strong" password (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkStrongPassword(field) {
  return check(field)
    .isStrongPassword()
    .withMessage(
      `${field} is required. (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1)`
    );
}
/**
 * Checks if the field, if present, is a "strong" password (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalStrongPassword(field) {
  return check(field)
    .optional()
    .isStrongPassword()
    .withMessage(
      `${field} is required. (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1)`
    );
}
/**
 * Checks if the field is of a valid date format (e.g. 2021-08-16).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsDateObject(field) {
  return check(field)
    .isDate()
    .withMessage(`${field} must be a valid date format`);
}
/**
 * Checks if the field is a array.
 * @param {*} field The field in the Request-Body to check.
 * @param {*} length The length of the array to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsArray(field, length) {
  return length
    ? check(field)
        .isArray()
        .isLength(length)
        .withMessage(`${field} must be a valid array of length ${length}`)
    : check(field).isArray().withMessage(`${field} must be a valid array`);
}
/**
 * Checks if the field is of a valid uuid format (e.g. 550e8400-e29b-11d4-a716-446655440000).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsUuidObject(field) {
  return check(field)
    .isUUID()
    .withMessage(`${field} must be a valid uuid format`);
}
/**
 * Checks if the field is of a valid integer.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsInt(field) {
  return check(field).isInt().withMessage(`${field} must be a valid integer`);
}
/**
 * Checks if the field is of a valid uuid format (e.g. 550e8400-e29b-11d4-a716-446655440000) or empty (null, undefined.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsUuidObjectOrEmpty(field) {
  return check(field)
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage(`${field} must be a valid uuid format`);
}
/**
 * Checks, when the field is present, if the field is of a valid uuid format (e.g. 550e8400-e29b-11d4-a716-446655440000).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalUuidObject(field) {
  return check(field)
    .optional()
    .isUUID()
    .withMessage(`${field} must be a valid uuid format`);
}
/**
 * Checks if the parameter is of a valid uuid format (e.g. 550e8400-e29b-11d4-a716-446655440000).
 * @param {*} name The name of the Request-Parameter to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkParamIsUuid(name) {
  return param(name)
    .isUUID()
    .withMessage(`${name} must be a valid uuid format`);
}
/**
 * Checks if the parameter is of a valid integer.
 * @param {*} name The name of the Request-Parameter to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkParamIsInt(name) {
  return param(name).isInt().withMessage(`${name} must be a valid integer`);
}
/**
 * Checks if the field is of a valid email format (e.g. best@mail.com).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsEmail(field) {
  return check(field)
    .isEmail()
    .withMessage(`${field} must be a valid email format`);
}
/**
 * Checks, when the field is present, if the field value matches one value of the provided valid values.
 * @param {*} field The field in the Request-Body to check.
 * @param {*} arrayOfValidValues A array of valid values to check against.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalIsOnlyOfValue(field, arrayOfValidValues) {
  return check(field)
    .optional()
    .isIn(arrayOfValidValues)
    .withMessage(`Value in ${field} must fit one of ${arrayOfValidValues}`);
}
/**
 * Checks if the field value matches one value of the provided valid values.
 * @param {*} field The field in the Request-Body to check.
 * @param {*} arrayOfValidValues A array of valid values to check against.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsOnlyOfValue(field, arrayOfValidValues) {
  return check(field)
    .isIn(arrayOfValidValues)
    .withMessage(`Value in ${field} must fit one of ${arrayOfValidValues}`);
}
/**
 * Checks, when the field is present, if the field is a valid boolean (true or false).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalIsBoolean(field) {
  return check(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean`);
}
/**
 * Checks, if the field is a valid boolean (true or false).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkIsBoolean(field) {
  return check(field).isBoolean().withMessage(`${field} must be a boolean`);
}
/**
 * Checks, when the field is present, if the field is a valid ISO8601 timestamp.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalIsISO8601(field) {
  return check(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a ISO8601 timestamp`);
}
/**
 * Checks, when the field is present, if the field is a string and not empty. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
function checkOptionalStringObjectNotEmpty(field) {
  return check(field)
    .optional()
    .not()
    .isEmpty()
    .withMessage(`${field} must be a string`)
    .trim()
    .escape();
}
/**
 * Checks in a query string, when the parameter is present, if the parameter value matches a columnname of the provided modelname.
 * @param {*} field The field in the Request-Body to check.
 * @param {*} modelName The name of the Model to check against.
 * @returns A ValidationChain object for the checked parameter.
 */
function queryOptionalColumnExistsInModel(field, modelName) {
  return query(field)
    .optional()
    .custom((value) => {
      const Model = require("../config/postgres")[modelName];
      const columnExists = Object.keys(Model.rawAttributes).includes(value);
      return columnExists;
    });
}
/**
 * Validates if one or more of the previous checks on fields failed. If at least one check failed, the response status of that call will be set to 400 and the addionally error information will be send to the response.
 * @param {*} req The Request object of the call to API.
 * @param {*} res The Response object of the call to API.
 * @returns The response if any error was found, else undefined.
 */
function validationHasErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.checkIsDateObject = checkIsDateObject;
exports.checkIsEmail = checkIsEmail;
exports.checkIsArray = checkIsArray;
exports.checkIsInt = checkIsInt;
exports.checkIsUuidObject = checkIsUuidObject;
exports.checkOptionalUuidObject = checkOptionalUuidObject;
exports.checkIsUuidObjectOrEmpty = checkIsUuidObjectOrEmpty;
exports.checkIsBoolean = checkIsBoolean;
exports.checkOptionalIsBoolean = checkOptionalIsBoolean;
exports.checkOptionalIsOnlyOfValue = checkOptionalIsOnlyOfValue;
exports.queryOptionalColumnExistsInModel = queryOptionalColumnExistsInModel;

exports.checkIsOnlyOfValue = checkIsOnlyOfValue;
exports.checkOptionalIsISO8601 = checkOptionalIsISO8601;

exports.checkStringObjectNotEmpty = checkStringObjectNotEmpty;
exports.checkStringObject = checkStringObject;
exports.checkOptionalStringObjectNotEmpty = checkOptionalStringObjectNotEmpty;

exports.checkStrongPassword = checkStrongPassword;
exports.checkOptionalStrongPassword = checkOptionalStrongPassword;

exports.checkParamIsUuid = checkParamIsUuid;
exports.checkParamIsInt = checkParamIsInt;

exports.validationHasErrors = validationHasErrors;
