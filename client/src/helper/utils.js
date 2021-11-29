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

export function dayAfter(date) {
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + 1);
  return retrieveDateOnly(dateObject.toISOString());
}

export function isEmail(value) {
  return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

export function isStrongPassword(value) {
  const regex =
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;
  return value.match(regex);
}
