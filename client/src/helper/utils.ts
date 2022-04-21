import { isString, isInteger } from "lodash-es";
import { utcToZonedTime } from "date-fns-tz";

export function isIsoDateWithoutTime(string: string) {
  const regex = /^\d{4}-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g;
  return string?.match(regex) != null;
}

export function setWindowName(namePostfix: string) {
  document.title = `${import.meta.env.VITE_PAGE_TITLE_PREFIX}${namePostfix}`;
}
export function retrieveDateOnly(isoDate?: string) {
  if (!isoDate) return "";
  return isoDate.substring(0, 10);
}
export function dayAfter(date?: string) {
  if (!date) return "";
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + 1);
  return retrieveDateOnly(dateObject.toISOString());
}

export function adjustDateToLocal(originalDate: string) {
  const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";
  return utcToZonedTime(new Date(originalDate).getTime(), tz);
}

export function isEmail(value: string) {
  if (!isString(value)) return; // TODO: Can be removed if all files use TS
  return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) != null;
}

export function isInt(value: string) {
  return isInteger(parseInt(value));
}

// TODO: How to do this in properly in TS?
export function findKeyByValue<T1, T2>(object: T1, value: T2) {
  // @ts-ignore
  return Object.keys(object).find((k) => object[k] == value);
}

/**
 * Checks if a string has the format of an coordinate in decimal degrees. It's required that the value has at least 4 but max 16 decimals.
 *
 * @param value That will be checked.
 * @returns A true or false.
 */
export function isCoordinate(value: string) {
  if (!isString(value)) return; // Can be removed if all files use TS
  return value.match(/^-?\d{0,3}.\d{4,16}$/) != null;
}

export function isDirection(value: string) {
  if (!isString(value)) return; // Can be removed if all files use TS
  return value.match(/^[NSOWnsow]{1,3}[-/,]?[NSOWnsow]{0,3}$/) != null;
}

export function isStrongPassword(value: string) {
  if (!isString(value)) return; // Can be removed if all files use TS
  const regex =
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%/=?^&*()<>\-__+.]){1,}).{8,}$/;
  return value.match(regex) != null;
}

/**
 * Accepts an array and an async callback and runs the callback in a foreach loop on that array.
 *
 * @param array The array we iterate on.
 * @param callback The async callback which will be called on every entry of the array.
 */
export async function asyncForEach<T1>(
  array: T1[],
  callback: { (arg: T1): void }
) {
  for (let index = 0; index < array.length; index++) {
    callback(array[index]);
  }
}

/**
 * Transforms a URL to a DataURL.
 *
 * @param url The URL to a remote image which will be converted to a dataURL.
 * @param callback The cb which will be called when the transformation is completed. Will receive a dataUrl as and the mimeType as parameters.
 */
export function convertRemoteImageToDataUrl(
  url: string,
  callback: { (dataUrl: string, mimeType: string): void }
) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      if (!reader?.result?.toString()) return;
      callback(reader.result.toString(), xhr.response.type);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

export function checkIfAnyValueOfObjectIsDefined(object: object) {
  return object && Object.values(object).find((v) => !!v) ? true : false;
}

export function checkIfDateIsDaysBeforeToday(
  date: Date | string,
  daysBeforeToday: number
) {
  const daysDifference =
    (new Date().getTime() - new Date(date).getTime()) / 1000 / 60 / 60 / 24;
  return daysDifference < daysBeforeToday;
}
export function activateHtmlLinks(message: string) {
  // Create clickable links from link text

  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  // Leave the stricter rule here for reference
  // const urlRegex =
  //   /(?:(?:https):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/g;

  const html = message.replace(urlRegex, (url: string) => {
    let hyperlink = url;

    if (!hyperlink.match("^https?://")) {
      hyperlink = "https://" + hyperlink;
    }
    // Open internal links in same window
    if (url.startsWith("https://xccup.net"))
      return `<a href="${hyperlink}" >${url}</a>`;
    return `<a href="${hyperlink}" target="_blank">${hyperlink}</a>`;
  });
  return html;
}
