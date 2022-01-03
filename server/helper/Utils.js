const logger = require("../config/logger");
const sanitizeHtml = require("sanitize-html");

async function sleep(ms) {
  logger.info(`Will suspend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentYear() {
  return new Date().getFullYear();
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

async function waitTillDbHasSync() {
  const RETRY_TIMEOUT = 3000;
  while (process.env.DB_SYNC_IN_PROGRESS == "true") {
    logger.info("Will wait till DB syncing has finished");
    await sleep(RETRY_TIMEOUT);
  }
  logger.info("DB syncing finished");
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
exports.waitTillDbHasSync = waitTillDbHasSync;
exports.generateRandomString = generateRandomString;
