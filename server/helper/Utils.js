const logger = require("../config/logger");
const sanitizeHtml = require("sanitize-html");

async function sleep(ms) {
  logger.info(`Will suspend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function findKeyByValue(objectToSearch, valueToFind) {
  for (const [key, value] of Object.entries(objectToSearch)) {
    if (value == valueToFind) return key;
  }
}

function arrayRemove(array, elementToRemove) {
  array.splice(array.indexOf(elementToRemove), 1);
}

function generateRandomString() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function sanitize(text) {
  return sanitizeHtml(text, {
    // Do not allow html at all
    allowedTags: [],
    allowedAttributes: {},
  });
}

exports.sanitizeHtml = sanitize;
exports.sleep = sleep;
exports.getCurrentYear = getCurrentYear;
exports.arrayRemove = arrayRemove;
exports.findKeyByValue = findKeyByValue;
exports.generateRandomString = generateRandomString;
