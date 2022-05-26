export function getbaseURL() {
  if (import.meta.env.MODE == "production")
    return `${location.protocol}//${location.hostname}/api/`;

  if (import.meta.env.VITE_BASE_USE_LIVE_API == "true")
    return "https://xccup.net/api/";
  return `${location.protocol}//${location.hostname}:3000/api/`;
}
