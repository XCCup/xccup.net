import { getbaseURL } from "./baseUrlHelper";

export function createUserPictureUrl(userId, thumb) {
  const thumbExtension = thumb ? "?thumb=true" : "";
  return `${getbaseURL()}users/picture/${userId}${thumbExtension}`;
}
