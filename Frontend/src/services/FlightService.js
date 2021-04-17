import axios from "axios";

// Local Dev server
// const baseURL = "http://localhost:4000";

const baseURL = "https://xccup.lurb.org/";

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// For https://my-json-server.typicode.com
const JSONUrl = "https://my-json-server.typicode.com/XCCup/xccup.net";

// Use this if using local JSON Server
// const JSONUrl = "http://localhost:3000";

const apiClient2 = axios.create({
  baseURL: JSONUrl,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  getFlights() {
    return apiClient.get("/flights");
  },
  getFlight(flightId) {
    return apiClient.get("/flights/" + flightId);
  },
  // getPilots() {
  //   return apiClient2.get("/pilots");
  // },
  // getDailyRanking() {
  //   return apiClient2.get("/tageswertung");
  // },
  // getClassRanking() {
  //   return apiClient2.get("/geraetewertung");
  // },
  getComments() {
    return apiClient2.get("/comments");
  },
  getDescription() {
    return apiClient2.get("/flightDescription");
  },
  uploadFlight(data) {
    return apiClient.post("/flights/upload", data);
  },
  getAirbuddies(flightId) {
    return apiClient.get("/airbuddies/" + flightId);
  },
  getInitialData() {
    return apiClient2.get("/db");
  },
};
