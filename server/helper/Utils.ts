import logger from "../config/logger";
import sanitizer from "sanitize-html";

export async function sleep(ms: number) {
  logger.info(`Will suspend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function findKeyByValue(objectToSearch: object, valueToFind: any) {
  for (const [key, value] of Object.entries(objectToSearch)) {
    if (value == valueToFind) return key;
  }
}

export function arrayRemove(array: Array<any>, elementToRemove: any) {
  array.splice(array.indexOf(elementToRemove), 1);
}

export function generateRandomString() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function sanitizeHtml(text: string) {
  return sanitizer(text, {
    // Do not allow html at all
    allowedTags: [],
    allowedAttributes: {},
  });
}

exports.sanitizeHtml = sanitizeHtml;
exports.sleep = sleep;
exports.getCurrentYear = getCurrentYear;
exports.arrayRemove = arrayRemove;
exports.findKeyByValue = findKeyByValue;
exports.generateRandomString = generateRandomString;
