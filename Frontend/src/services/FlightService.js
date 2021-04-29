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
let JSONUrl = "https://my-json-server.typicode.com/XCCup/xccup.net";

// Use this if using local JSON Server
// JSONUrl = "http://localhost:3000";

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

  // These will be obsolete if the flight modell contains comments and description
  getComments() {
    return apiClient2.get("/comments");
  },
  getDescription() {
    return apiClient2.get("/flightDescription");
  },

  uploadFlight(data) {
    return apiClient2.post("/flights/", data);
  },
  getAirbuddies(flightId) {
    return apiClient.get("/airbuddies/" + flightId);
  },
  getInitialData() {
    return apiClient2.get("/db");
  },
  addComment(comment) {
    return apiClient2.post("/comments", comment);
  },
  deleteComment(commentId) {
    return apiClient2.delete("/comments/", { params: { id: commentId } });
  },
};
