import axios from "axios";
import jwtInterceptor from "@/shared/jwtInterceptor";

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
    return apiClient.get("flights");
  },
  getFlight(flightId) {
    return apiClient.get("flights/" + flightId);
  },
  uploadIgc(data) {
    return jwtInterceptor.post(baseURL + "flights/", data);
    // return apiClient.post("flights/", data);
  },
  uploadFlightDetails(flightId, data) {
    return jwtInterceptor.put(baseURL + "flights/" + flightId, data);
    // return apiClient.put("flights/" + flightId, data);
  },
  uploadImages(data) {
    return jwtInterceptor.post(baseURL + "media/", data);
  },
  getAirbuddies(flightId) {
    return apiClient.get("airbuddies/" + flightId);
  },
  getInitialData() {
    return apiClient.get("home");
  },
  addComment(comment) {
    return jwtInterceptor.post(baseURL + "comments", comment);
  },
  deleteComment(commentId) {
    return jwtInterceptor.delete(baseURL + "comments/" + commentId);
  },
  editComment(comment) {
    return jwtInterceptor.put(baseURL + "comments/" + comment.id, comment);
  },
  getCommentsOfFlight(flightId) {
    return apiClient.get("comments/flight/" + flightId);
  },
};
