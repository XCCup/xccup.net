import { getbaseURL } from "./baseUrlHelper";

export function createUserPictureUrl(userId, thumb) {
  if (!userId) return;
  const thumbExtension = thumb ? "?thumb=true" : "";
  return `${getbaseURL()}users/picture/${userId}${thumbExtension}`;
}
