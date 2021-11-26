export function getbaseURL() {
  let URL =
    window.location.protocol.toString() +
    "//" +
    window.location.hostname.toString() +
    "/api/";
  if (process.env.NODE_ENV == "production") {
    import.meta.env.VITE_API_URL;
  }
  return URL;
}
