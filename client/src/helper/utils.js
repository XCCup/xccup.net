export function isIsoDateWithoutTime(string) {
  const regex = /^\d{4}-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g;
  return string?.match(regex) != null;
}

export function setWindowName(namePostfix) {
  document.title = `${import.meta.env.VITE_PAGE_TITLE_PREFIX}${namePostfix}`;
}
export function retrieveDateOnly(isoDate) {
  return isoDate.substring(0, 10);
}
export function retrieveDatePartFromDate(date) {
  const offset = date.getTimezoneOffset();

  // Without offset correction the wrong day (the day before) will maybe set
  date.setHours(date.getHours() - offset / 60);

  return retrieveDateOnly(date.toISOString());
}

export function dayAfter(date) {
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + 1);
  return retrieveDateOnly(dateObject.toISOString());
}

export function isEmail(value) {
  return value && value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

export function isStrongPassword(value) {
  const regex =
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;
  return value && value.match(regex);
}

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function convertRemoteImageToDataUrl(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

export function checkIfAnyValueOfObjectIsDefined(object) {
  return object && Object.values(object).find((v) => !!v) ? true : false;
}

export function checkIfDateIsDaysBeforeToday(date, daysBeforeToday) {
  const daysDifference =
    (new Date().getTime() - new Date(date).getTime()) / 1000 / 60 / 60 / 24;
  return daysDifference < daysBeforeToday;
}
