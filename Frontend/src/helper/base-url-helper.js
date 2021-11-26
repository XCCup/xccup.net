export function getbaseURL() {
  let URL =
    window.location.protocol.toString() +
    "//" +
    window.location.hostname.toString() +
    ":3000/api/";
  if (process.env.NODE_ENV == "production") {
    URL = import.meta.env.VITE_API_URL;
  }
  return URL;
}
