import axios from "axios";
import jwtInterceptor from "@/helper/jwtInterceptor";
import { getbaseURL } from "@/helper/baseUrlHelper";
import router from "@/router/";

import type { FilterParams } from "@/types/FilterParams";
import type { ModifiedFlightData } from "@/types/ModifiedFlightData";
import type { NewComment, Comment } from "@/types/Comment";
import type { CreateUserData, UserData } from "@/types/UserData";
import type { Glider } from "@/types/Glider";
import type { Mail } from "@/types/Mail";
import type { CreateNews, News } from "@/types/News";
import type { FlyingSite } from "@/types/FlyingSite";

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
  getFlights(params: FilterParams) {
    console.log(JSON.stringify(params));

    return apiClient.get("flights", { params });
  },
  getFlight(flightId: string) {
    return apiClient.get("flights/" + flightId);
  },
  deleteFlight(externalId: string) {
    return jwtInterceptor.delete(baseURL + "flights/" + externalId);
  },
  uploadIgc(data: FormData) {
    return jwtInterceptor.post(baseURL + "flights/", data);
  },
  editFlightDetails(flightId: string, data: ModifiedFlightData) {
    return jwtInterceptor.put(baseURL + "flights/" + flightId, data);
  },

  // Photos
  uploadPhotos(data: FormData) {
    return jwtInterceptor.post(baseURL + "flights/photos/", data);
  },
  editPhoto(id: string, data: string) {
    return jwtInterceptor.put(baseURL + "flights/photos/" + id, data);
  },
  getInitialData() {
    return apiClient.get("home");
  },
  deletePhoto(id: string) {
    return jwtInterceptor.delete(baseURL + "flights/photos/" + id);
  },
  // Flight comments

  addComment(comment: NewComment) {
    return jwtInterceptor.post(baseURL + "comments", comment);
  },
  deleteComment(commentId: string) {
    return jwtInterceptor.delete(baseURL + "comments/" + commentId);
  },
  editComment(comment: Comment) {
    return jwtInterceptor.put(baseURL + "comments/" + comment.id, comment);
  },
  getCommentsOfFlight(flightId: string) {
    return apiClient.get("comments/flight/" + flightId);
  },

  // Profile

  getUserDetails() {
    return jwtInterceptor.get(baseURL + "users/");
  },
  updateUserProfile(userProfile: UserData) {
    return jwtInterceptor.put(baseURL + "users/", userProfile);
  },
  getGliders(userId: string) {
    return userId
      ? jwtInterceptor.get(baseURL + "users/gliders/get/" + userId)
      : jwtInterceptor.get(baseURL + "users/gliders/get");
  },
  setDefaultGlider(gliderId: string) {
    return jwtInterceptor.put(baseURL + "users/gliders/default/" + gliderId);
  },
  addGlider(glider: Glider) {
    return jwtInterceptor.post(baseURL + "users/gliders/add", glider);
  },
  removeGlider(gliderId: string) {
    return jwtInterceptor.delete(baseURL + "users/gliders/remove/" + gliderId);
  },
  uploadUserPicture(data: FormData) {
    return jwtInterceptor.post(baseURL + "users/picture/", data);
  },
  deleteUserPicture() {
    return jwtInterceptor.delete(baseURL + "users/picture/");
  },

  // Mail

  // sendMailToAll(mail) {
  //   return jwtInterceptor.post(baseURL + "mail/all", mail);
  // },

  sendMailToSingleUser(mail: Mail) {
    return jwtInterceptor.post(baseURL + "mail/single", mail);
  },

  // Admin

  getAdminNotifications() {
    return jwtInterceptor.get(baseURL + "users/adminNotifications");
  },
  getTShirtList(year = new Date().getFullYear()) {
    return jwtInterceptor.get(baseURL + "users/tshirts/" + year);
  },
  getUserEmails(includeAll: boolean) {
    return jwtInterceptor.get(baseURL + "users/emails/" + includeAll);
  },
  getCacheStats() {
    return jwtInterceptor.get(baseURL + "cache/stats");
  },
  deleteCache(key: string) {
    return jwtInterceptor.get(baseURL + "cache/clear/" + key);
  },
  getFlightViolations() {
    return jwtInterceptor.get(baseURL + "flights/violations");
  },
  getFlightsSelf() {
    return jwtInterceptor.get(baseURL + "flights/self");
  },
  acceptFlightViolations(flightId: string) {
    return jwtInterceptor.put(baseURL + "flights/acceptViolation/" + flightId);
  },
  getAllNews() {
    return jwtInterceptor.get(baseURL + "news/");
  },
  getPublicNews() {
    return apiClient.get(baseURL + "news/public/");
  },
  addNews(news: CreateNews) {
    return jwtInterceptor.post(baseURL + "news/", news);
  },
  editNews(news: News) {
    return jwtInterceptor.put(baseURL + "news/" + news.id, news);
  },
  deleteNews(newsId: string) {
    return jwtInterceptor.delete(baseURL + "news/" + newsId);
  },

  // Results

  getResultsOverall(params: FilterParams) {
    return apiClient.get("results/", {
      params,
    });
  },
  getResultsNewcomer(params: FilterParams) {
    return apiClient.get("results/newcomer", {
      params,
    });
  },
  getResultsSeniors(params: FilterParams) {
    return apiClient.get("results/seniors", {
      params,
    });
  },
  getResultsLadies(params: FilterParams) {
    return apiClient.get("results/?gender=F", {
      params,
    });
  },
  getResultsLux(params: FilterParams) {
    return apiClient.get("results/state/LUX", {
      params,
    });
  },
  getResultsRlp(params: FilterParams) {
    return apiClient.get("results/state/RP", {
      params,
    });
  },
  getResultsTeams(params: FilterParams) {
    return apiClient.get("results/teams", {
      params,
    });
  },
  getResultsClubs(params: FilterParams) {
    return apiClient.get("results/clubs", {
      params,
    });
  },
  getResultsEarlybird(params: FilterParams) {
    return apiClient.get("results/earlybird", {
      params,
    });
  },
  getResultsLatebird(params: FilterParams) {
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

  register(userData: CreateUserData) {
    return apiClient.post(baseURL + "users/", userData);
  },

  getUsers(params: FilterParams) {
    return apiClient.get("users/public/", { params });
  },

  getUser(userId: string) {
    return jwtInterceptor.get("users/public/" + userId);
  },

  activate(userId: string, token: string) {
    return apiClient.get(`users/activate?userId=${userId}&token=${token}`);
  },

  requestNewPassword(email: string) {
    return apiClient.post(`users/request-new-password`, { email: email });
  },

  changePassword(password: string) {
    return jwtInterceptor.put(baseURL + "users/change-password", {
      password: password,
    });
  },

  confirmNewPassword(userId: string, token: string) {
    return apiClient.get(
      `users/renew-password?userId=${userId}&token=${token}`
    );
  },

  changeEmail(email: string) {
    return jwtInterceptor.put(baseURL + "users/change-email", { email: email });
  },

  confirmMailChange(userId: string, token: string, email: string) {
    return apiClient.get(
      `users/confirm-mail-change?userId=${userId}&token=${token}&email=${email}`
    );
  },

  // Sponsors

  /**
   * @param {Boolean} retrieveAll If set to true all data - including non public ones - will be retrieved. The user needs to have an "elevated" role to use the option "retrieveAll".
   * @returns An array with sponsor objects.
   */
  getSponsors(retrieveAll: boolean) {
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
  getClubs(retrieveAll: boolean) {
    return retrieveAll
      ? jwtInterceptor.get(baseURL + "/clubs")
      : apiClient.get("/clubs/public");
  },

  // Teams

  getTeamNames() {
    return apiClient.get("teams/names/");
  },

  getTeams(params: FilterParams) {
    return apiClient.get("teams/", { params });
  },

  getUserWithoutTeam() {
    return apiClient.get("teams/availableUsers/");
  },

  addTeam(data: { name: string; memberIds: string[] }) {
    return jwtInterceptor.post(baseURL + "teams/", data);
  },

  // FlyingSites

  addSite(data: FlyingSite) {
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

  acceptSite(id: string) {
    return jwtInterceptor.put(baseURL + "sites/accept/" + id);
  },

  deleteSite(id: string) {
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
  getAirspaces(query: string) {
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
