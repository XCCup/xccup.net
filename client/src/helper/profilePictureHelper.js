import { getbaseURL } from "./baseUrlHelper";

export function createUserPictureUrl(userId, options = {}) {
  if (!userId) return;
  const size = options.size ? `?size=${options.size}` : "";
  return `${getbaseURL()}users/picture/${userId}${size}`;
}
