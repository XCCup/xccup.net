import axios from "axios";
import jwtInterceptor from "@/shared/jwtInterceptor";

let baseURL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
// Note: jwtInterceptor is used when a route needs authorization

export default {
  getFlights(params) {
    return apiClient.get("flights", { params: { year: params.year } });
  },
  getFlight(flightId) {
    return apiClient.get("flights/" + flightId);
  },
  deleteFlight(externalId) {
    return jwtInterceptor.delete(baseURL +"flights/" + externalId);
  },
  uploadIgc(data) {
    return jwtInterceptor.post(baseURL + "flights/", data);
  },
  uploadFlightDetails(flightId, data) {
    return jwtInterceptor.put(baseURL + "flights/" + flightId, data);
  },
  uploadImages(data) {
    return jwtInterceptor.post(baseURL + "flights/photos/", data);
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
  getUserDetails() {
    return jwtInterceptor.get(baseURL + "users/");
  },
  updateUserProfile(userProfile) {
    return jwtInterceptor.put(baseURL + "users/", userProfile);
  },
  getGliders() {
    return jwtInterceptor.get(baseURL + "users/gliders/get");
  },
  setDefaultGlider(gliderId) {
    return jwtInterceptor.put(baseURL + "users/gliders/default/" + gliderId);
  },
  addGlider(glider) {
    return jwtInterceptor.post(baseURL + "users/gliders/add", glider);
  },
  removeGlider(gliderId) {
    return jwtInterceptor.delete(baseURL + "users/gliders/remove/" + gliderId);
  },
  getFlightViolations(){
    return jwtInterceptor.get(baseURL + "flights?unchecked=true");
  },
  acceptFlightViolations(flightId){
    return jwtInterceptor.put(baseURL + "flights/acceptViolation/" + flightId);
  },
  getAllNews(){
    return jwtInterceptor.get(baseURL + "news/");
  },
  addNews(news){
    return jwtInterceptor.post(baseURL + "news/",news);
  },
  editNews(news){
    return jwtInterceptor.put(baseURL + "news/"+news.id,news);
  },
  deleteNews(newsId){
    return jwtInterceptor.delete(baseURL + "news/"+newsId);
  },
  // Results
  getResults(category, params) {
    return apiClient.get("results/" + category, {
      params: { year: params.year },
    });
  },
  // General
  getBrands() {
    return apiClient.get(baseURL + "general/brands");
  },
  getGliderClasses() {
    return apiClient.get(baseURL + "general/gliderClasses");
  },
};
