import axios from "axios";

let baseURL = "https://xccup.lurb.org/";

if (process.env.VUE_APP_USE_LOCAL_API === "true") {
  console.log("Using localhost:3000 for API calls");
  baseURL = "http://localhost:3000";
}

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
  userLogin(data) {
    return apiClient.post("/users/login", data);
  },
  getFlights() {
    return apiClient2.get("/tageswertung");
  },
  getFlight(flightId) {
    return apiClient.get("/flights/" + flightId);
  },
  // These will be obsolete if the flight modell contains comments and description
  getComments() {
    return apiClient2.get("/comments");
  },
  getDescription() {
    return apiClient2.get("/flightDescription");
  },
  uploadIgc(data) {
    return apiClient.post("/flights/", data);
  },
  uploadFlightDetails(flightId, data) {
    return apiClient.put("/flights/" + flightId, data);
  },
  getAirbuddies(flightId) {
    return apiClient.get("/airbuddies/" + flightId);
  },
  getInitialData() {
    return apiClient2.get("/db");
  },
  addComment(comment) {
    return apiClient.post("/comments", comment);
  },
  deleteComment(commentId) {
    return apiClient.delete("/comments/" + commentId);
  },
};
