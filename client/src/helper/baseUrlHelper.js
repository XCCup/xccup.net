export function getbaseURL() {
  if (process.env.NODE_ENV == "production")
    return `${location.protocol}//${location.hostname}/api/`;

  return `${location.protocol}//${location.hostname}:3000/api/`;
}
