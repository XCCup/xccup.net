import axios from "axios";
import jwtInterceptor from "@/helper/jwtInterceptor";
import { getbaseURL } from "@/helper/baseUrlHelper";
import router from "@/router/";

const baseURL = getbaseURL();

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    //  Only route to network error page if it's a get request.
    if (error.message === "Network Error" && error.config.method === "get") {
      console.log("Network error");
      router.push({
        name: "NetworkError",
      });
    }
    return Promise.reject(error);
  }
);

export default {
  getFlights(params) {
    return apiClient.get("flights", { params });
  },
  getFlight(flightId) {
    return apiClient.get("flights/" + flightId);
  },
  deleteFlight(externalId) {
    return jwtInterceptor.delete(baseURL + "flights/" + externalId);
  },
  uploadIgc(data) {
    return jwtInterceptor.post(baseURL + "flights/", data);
  },
  editFlightDetails(flightId, data) {
    return jwtInterceptor.put(baseURL + "flights/" + flightId, data);
  },

  // Photos
  uploadPhotos(data) {
    return jwtInterceptor.post(baseURL + "flights/photos/", data);
  },
  editPhoto(id, data) {
    return jwtInterceptor.put(baseURL + "flights/photos/" + id, data);
  },
  getInitialData() {
    return apiClient.get("home");
  },
  deletePhoto(id) {
    return jwtInterceptor.delete(baseURL + "flights/photos/" + id);
  },
  // Flight comments

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

  // Profile

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
  uploadUserPicture(data) {
    return jwtInterceptor.post(baseURL + "users/picture/", data);
  },
  deleteUserPicture() {
    return jwtInterceptor.delete(baseURL + "users/picture/");
  },

  // Mail

  sendMailToAll(mail) {
    return jwtInterceptor.post(baseURL + "mail/all", mail);
  },
  sendMailToSingleUser(mail) {
    return jwtInterceptor.post(baseURL + "mail/single", mail);
  },

  // Admin

  getFlightViolations() {
    return jwtInterceptor.get(baseURL + "flights/violations");
  },
  acceptFlightViolations(flightId) {
    return jwtInterceptor.put(baseURL + "flights/acceptViolation/" + flightId);
  },
  getAllNews() {
    return jwtInterceptor.get(baseURL + "news/");
  },
  getPublicNews() {
    return apiClient.get(baseURL + "news/public/");
  },
  addNews(news) {
    return jwtInterceptor.post(baseURL + "news/", news);
  },
  editNews(news) {
    return jwtInterceptor.put(baseURL + "news/" + news.id, news);
  },
  deleteNews(newsId) {
    return jwtInterceptor.delete(baseURL + "news/" + newsId);
  },

  // Results

  getResultsOverall(params) {
    return apiClient.get("results/", {
      params,
    });
  },
  getResultsNewcomer(params) {
    return apiClient.get("results/newcomer", {
      params,
    });
  },
  getResultsSeniors(params) {
    return apiClient.get("results/seniors", {
      params,
    });
  },
  getResultsLadies(params) {
    return apiClient.get("results/?gender=F", {
      params,
    });
  },
  getResultsLux(params) {
    return apiClient.get("results/?state=LUX", {
      params,
    });
  },
  getResultsRlp(params) {
    return apiClient.get("results/?state=RP", {
      params,
    });
  },
  getResultsTeams(params) {
    return apiClient.get("results/teams", {
      params,
    });
  },
  getResultsClubs(params) {
    return apiClient.get("results/clubs", {
      params,
    });
  },
  getResultsEarlybird(params) {
    return apiClient.get("results/earlybird", {
      params,
    });
  },
  getResultsLatebird(params) {
    return apiClient.get("results/latebird", {
      params,
    });
  },
  getResultsSiteRecords() {
    return apiClient.get("results/siteRecords");
  },

  // Users

  getUserNames() {
    return apiClient.get("users/names/");
  },

  register(userData) {
    return apiClient.post(baseURL + "users/", userData);
  },

  getUsers(params) {
    return apiClient.get("users/public/", { params });
  },

  getUser(userId) {
    return jwtInterceptor.get("users/public/" + userId);
  },

  activate(userId, token) {
    return apiClient.get(`users/activate?userId=${userId}&token=${token}`);
  },

  requestNewPassword(email) {
    return apiClient.post(`users/request-new-password`, email);
  },

  changePassword(password) {
    return jwtInterceptor.put(baseURL + "users/change-password", password);
  },

  confirmNewPassword(userId, token) {
    return apiClient.get(
      `users/renew-password?userId=${userId}&token=${token}`
    );
  },

  changeEmail(email) {
    return jwtInterceptor.put(baseURL + "users/change-email", email);
  },

  confirmMailChange(userId, token, email) {
    return apiClient.get(
      `users/confirm-mail-change?userId=${userId}&token=${token}&email=${email}`
    );
  },

  // Sponsors

  /**
   * @param {Boolean} retrieveAll If set to true all data - including non public ones - will be retrieved. The user needs to have an "elevated" role to use the option "retrieveAll".
   * @returns An array with sponsor objects.
   */
  getSponsors(retrieveAll) {
    return retrieveAll
      ? jwtInterceptor.get(baseURL + "/sponsors")
      : apiClient.get("/sponsors/public");
  },

  // Clubs

  getClubNames() {
    return apiClient.get("clubs/names/");
  },

  /**
   * @param {Boolean} retrieveAll If set to true all data - including non public ones - will be retrieved. The user needs to have an "elevated" role to use the option "retrieveAll".
   * @returns An array with club objects.
   */
  getClubs(retrieveAll) {
    return retrieveAll
      ? jwtInterceptor.get(baseURL + "/clubs")
      : apiClient.get("/clubs/public");
  },

  // Teams

  getTeamNames() {
    return apiClient.get("teams/names/");
  },

  getTeams(params) {
    return apiClient.get("teams/", { params });
  },

  getUserWithoutTeam() {
    return apiClient.get("teams/availableUsers/");
  },

  addTeam(data) {
    return jwtInterceptor.post(baseURL + "teams/", data);
  },

  // FlyingSites

  addSite(data) {
    return jwtInterceptor.post(baseURL + "sites/", data);
  },

  getSiteNames() {
    return apiClient.get("sites/names/");
  },

  getSites() {
    return apiClient.get("sites");
  },

  getSitesProposed() {
    return jwtInterceptor.get(baseURL + "sites/proposed");
  },

  acceptSite(id) {
    return jwtInterceptor.put(baseURL + "sites/accept/" + id);
  },

  deleteSite(id) {
    return jwtInterceptor.delete(baseURL + "sites/" + id);
  },

  // General
  getCurrentSeason() {
    return apiClient.get(baseURL + "seasons/current");
  },
  getBrands() {
    return apiClient.get(baseURL + "general/brands");
  },
  getGliderClasses() {
    return apiClient.get(baseURL + "general/gliderClasses");
  },
  getRankingClasses() {
    return apiClient.get(baseURL + "general/rankingClasses");
  },
  getAirspaces(query) {
    return apiClient.get(baseURL + "airspaces/relevant", {
      params: { p: query },
    });
  },
  getUserProfileConstants() {
    return apiClient.get(baseURL + "general/user/constants");
  },
  getFilterOptions() {
    return apiClient.get(baseURL + "general/filterOptions");
  },
};
