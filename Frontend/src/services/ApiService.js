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
    return apiClient.get("tageswertung");
  },
  getFlight(flightId) {
    return apiClient.get("flights/" + flightId);
  },
  // TODO: Obsolete?
  getDescription() {
    return apiClient.get("flightDescription");
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
    return jwtInterceptor.post(baseURL + "medias/", data);
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
