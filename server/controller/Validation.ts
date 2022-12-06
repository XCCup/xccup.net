import { Request, Response } from "express";
import { check, param, query, validationResult } from "express-validator";
import { MinMaxOptions } from "express-validator/src/options";
import { sanitizeHtml } from "../helper/Utils";

/**
 * Checks if the field is a string. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkStringObject(field: string) {
  return check(field).trim().escape();
}

/**
 * Checks if the field is a string. HTML will be sanitized.
 * @param {*} field The field in the Reqpuest-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkStringObjectNoEscaping(field: string) {
  return check(field)
    .trim()
    .customSanitizer((value) => sanitizeHtml(value));
}

/**
 * Checks if the field is a string and not empty. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkStringObjectNotEmpty(field: string) {
  return check(field)
    .not()
    .isEmpty()
    .withMessage(`${field} is required`)
    .trim()
    .escape();
}
/**
 * Checks if the field is a string and not empty. HTML will be sanitized.
 * If content only consists of html, value would be empty and therefore
 * is checked again.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkStringObjectNotEmptyNoEscaping(field: string) {
  return check(field)
    .not()
    .isEmpty()
    .withMessage(`${field} is required`)
    .customSanitizer((value) => sanitizeHtml(value))
    .not()
    .isEmpty()
    .withMessage(`HTML is not allowed`);
}
/**
 * Checks if the field is not empty.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkFieldNotEmpty(field: string) {
  return check(field).not().isEmpty().withMessage(`${field} is required`);
}
/**
 * Checks if the field is a "strong" password (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkStrongPassword(field: string) {
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
export function checkOptionalStrongPassword(field: string) {
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
export function checkIsDateObject(field: string) {
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
export function checkIsArray(field: string, length: MinMaxOptions) {
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
export function checkIsUuidObject(field: string) {
  return check(field)
    .isUUID()
    .withMessage(`${field} must be a valid uuid format`);
}
/**
 * Checks if the field is of a valid integer.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkIsInt(field: string) {
  return check(field).isInt().withMessage(`${field} must be a valid integer`);
}
/**
 * Checks if the field is of a valid float value.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkIsFloat(field: string) {
  return check(field).isFloat().withMessage(`${field} must be a valid float`);
}
/**
 * Checks if the field is of a valid uuid format (e.g. 550e8400-e29b-11d4-a716-446655440000) or empty (null, undefined.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkIsUuidObjectOrEmpty(field: string) {
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
export function checkOptionalUuidObject(field: string) {
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
export function checkParamIsUuid(name: string) {
  return param(name)
    .isUUID()
    .withMessage(`${name} must be a valid uuid format`);
}
/**
 * Checks if the parameter is of a valid boolean type
 * @param {*} name The name of the Request-Parameter to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkParamIsBoolean(name: string) {
  return param(name).isBoolean().withMessage(`${name} must be a valid boolean`);
}
/**
 * Checks if the parameter is of a valid integer.
 * @param {*} name The name of the Request-Parameter to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkParamIsInt(name: string) {
  return param(name).isInt().withMessage(`${name} must be a valid integer`);
}
/**
 * Checks if the field is of a valid email format (e.g. best@mail.com).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkIsEmail(field: string) {
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
export function checkOptionalIsOnlyOfValue(
  field: string,
  arrayOfValidValues: any[]
) {
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
export function checkParamIsOnlyOfValue(
  field: string,
  arrayOfValidValues: any[]
) {
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
export function checkIsOnlyOfValue(field: string, arrayOfValidValues: any[]) {
  return check(field)
    .isIn(arrayOfValidValues)
    .withMessage(`Value in ${field} must fit one of ${arrayOfValidValues}`);
}
/**
 * Checks, when the field is present, if the field is a valid boolean (true or false).
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkOptionalIsBoolean(field: string) {
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
export function checkIsBoolean(field: string) {
  return check(field).isBoolean().withMessage(`${field} must be a boolean`);
}
/**
 * Checks if the field is a valid ISO8601 timestamp.
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkIsISO8601(field: string) {
  return check(field)
    .isISO8601()
    .withMessage(`${field} must be a ISO8601 timestamp`);
}
/**
 * Checks, when the field is present, if the field is a string and not empty. Addionally escapes all special charcters (e.g. ">","<").
 * @param {*} field The field in the Request-Body to check.
 * @returns A ValidationChain object for the checked field.
 */
export function checkOptionalStringObjectNotEmpty(field: string) {
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
export function queryOptionalColumnExistsInModel(
  field: string,
  modelName: string
) {
  return query(field)
    .optional()
    .custom((value) => {
      const Model = require("../db")[modelName];
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
export function validationHasErrors(req: Request, res: Response) {
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
exports.checkParamIsOnlyOfValue = checkParamIsOnlyOfValue;
exports.checkOptionalIsOnlyOfValue = checkOptionalIsOnlyOfValue;
exports.checkIsFloat = checkIsFloat;

exports.checkIsOnlyOfValue = checkIsOnlyOfValue;
exports.checkIsISO8601 = checkIsISO8601;
exports.checkStringObjectNoEscaping = checkStringObjectNoEscaping;

exports.checkStringObjectNotEmpty = checkStringObjectNotEmpty;
exports.checkStringObject = checkStringObject;
exports.checkStringObjectNotEmptyNoEscaping =
  checkStringObjectNotEmptyNoEscaping;
exports.checkOptionalStringObjectNotEmpty = checkOptionalStringObjectNotEmpty;

exports.checkStrongPassword = checkStrongPassword;
exports.checkOptionalStrongPassword = checkOptionalStrongPassword;

exports.checkParamIsUuid = checkParamIsUuid;
exports.checkParamIsInt = checkParamIsInt;
exports.checkParamIsBoolean = checkParamIsBoolean;

exports.queryOptionalColumnExistsInModel = queryOptionalColumnExistsInModel;

exports.checkFieldNotEmpty = checkFieldNotEmpty;

exports.validationHasErrors = validationHasErrors;
