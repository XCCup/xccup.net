export function getbaseURL() {
  if (process.env.NODE_ENV == "production") return import.meta.env.VITE_API_URL;

  return `${location.protocol}//${location.hostname}:3000/api/`;
}
