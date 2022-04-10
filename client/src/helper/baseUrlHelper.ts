export function getbaseURL() {
  // TODO: Why does TS not recognize this type?
  // @ts-ignore
  if (process.env.NODE_ENV == "production")
    return `${location.protocol}//${location.hostname}/api/`;

  if (import.meta.env.VITE_BASE_USE_LIVE_API == "true")
    return "https://xccup.net/api/";
  return `${location.protocol}//${location.hostname}:3000/api/`;
}
