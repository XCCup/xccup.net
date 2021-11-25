export function getBaseUrl() {
  let URL =
    window.location.protocol.toString() +
    "//" +
    window.location.hostname.toString() +
    "/api";
  if (process.env.NODE_ENV == "development") {
    console.log(process.env.NODE_ENV);
    URL =
      window.location.protocol.toString() +
      "//" +
      window.location.hostname.toString() +
      ":3031";
  }
  return URL;
}
