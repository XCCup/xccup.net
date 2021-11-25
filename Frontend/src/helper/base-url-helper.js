export function getbaseURL() {
  let URL =
    window.location.protocol.toString() +
    "//" +
    window.location.hostname.toString() +
    "/api/";
  if (process.env.NODE_ENV == "development") {
    // Todo: use .env?
    URL =
      window.location.protocol.toString() +
      "//" +
      window.location.hostname.toString() +
      ":3000/" +
      "api/";
  }
  return URL;
}
