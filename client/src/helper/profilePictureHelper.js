import { getbaseURL } from "./baseUrlHelper";

export function createDicebearUrl(user) {
  const seedChars = "<>!&()-:'|";

  const initals =
    user.firstName.substring(0, 1) + user.lastName.substring(0, 1);

  const seed =
    seedChars[user.id.charCodeAt(0) % seedChars.length] +
    seedChars[user.id.charCodeAt(1) % seedChars.length] +
    seedChars[user.id.charCodeAt(2) % seedChars.length];

  const url = `https://avatars.dicebear.com/api/initials/${seed}${initals}.svg`;

  return url;
}

export function createUserPictureUrl(user, thumb) {
  const thumbExtension = thumb ? "?thumb=true" : "";
  return `${getbaseURL()}users/picture/${user.id}${thumbExtension}`;
}

export function getUserAvatar(user, thumb) {
  return user.picture
    ? createUserPictureUrl(user, thumb)
    : createDicebearUrl(user);
}
