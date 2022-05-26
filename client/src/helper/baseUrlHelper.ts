export function getbaseURL(): string {
  if (
    import.meta.env.MODE != "production" &&
    import.meta.env.VITE_BASE_USE_LIVE_API != "true"
  )
    return `${location.protocol}//${location.hostname}:3000/api/`;

  if (import.meta.env.VITE_BASE_API) return import.meta.env.VITE_BASE_API;

  if (import.meta.env.MODE == "production")
    return `${location.protocol}//${location.hostname}/api/`;

  return `${location.protocol}//${location.hostname}:3000/api/`;
}
