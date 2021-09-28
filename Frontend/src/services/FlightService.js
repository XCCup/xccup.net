import axios from "axios";
let baseURL = process.env.VUE_APP_API_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  // userLogin(data) {
  //   return apiClient.post("/users/login", data);
  // },

  // TODO: Needs implementation
  getFlights() {
    return apiClient.get("tageswertung");
  },
  getFlight(flightId) {
    return apiClient.get("flights/" + flightId);
  },
  // TODO: Obsolete?
  // These will be obsolete if the flight modell contains comments and description
  getComments() {
    return apiClient.get("comments");
  },

  // TODO: Obsolete?
  getDescription() {
    return apiClient.get("flightDescription");
  },
  uploadIgc(data) {
    return apiClient.post("flights/", data);
  },
  uploadFlightDetails(flightId, data) {
    return apiClient.put("flights/" + flightId, data);
  },
  getAirbuddies(flightId) {
    return apiClient.get("airbuddies/" + flightId);
  },
  getInitialData() {
    return apiClient.get("home");
  },
  addComment(comment) {
    return apiClient.post("comments", comment);
  },
  deleteComment(commentId) {
    return apiClient.delete("comments/" + commentId);
  },
};
