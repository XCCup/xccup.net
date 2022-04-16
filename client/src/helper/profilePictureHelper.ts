import { getbaseURL } from "./baseUrlHelper";

export function createUserPictureUrl(
  userId: string,
  options?: { size: string }
) {
  if (!userId) return;
  const size = options?.size ? `?size=${options.size}` : "";
  return `${getbaseURL()}users/picture/${userId}${size}`;
}
