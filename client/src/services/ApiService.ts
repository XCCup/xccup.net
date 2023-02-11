import axios from "axios";
import { getbaseURL } from "@/helper/baseUrlHelper";

import type {
  ClubsFilterParams,
  FlightsFilterParams,
  LuxFilterParams,
  NewcomerFilterParams,
  OverallFilterParams,
  OverallLadiesFilterParams,
  ResultsEarlyBirdFilterParams,
  ResultsLateBirdFilterParams,
  ResultsTeamsFilterParams,
  ReynoldsClassFilterParams,
  RlpFilterParams,
  SeniorsFilterParams,
  TeamsFilterParams,
  UserFilterParams,
} from "@/types/FilterParams";
import type { ModifiedFlightData } from "@/types/ModifiedFlightData";
import type { NewComment, Comment } from "@/types/Comment";
import type { CreateUserData, UserData } from "@/types/UserData";
import type { Glider } from "@/types/Glider";
import type { Mail } from "@/types/Mail";
import type { CreateNews, News } from "@/types/News";
import type { FlyingSite } from "@/types/FlyingSite";
import type { Flight } from "@/types/Flight";
import type { SeasonDetail } from "@/types/SeasonDetail";

import useAxiosJwt, {
  type IAuthTokens,
  type TokenRefreshRequest,
} from "@/composables/useAxiosJwt";
import type { Sponsor } from "@/types/Sponsor";
import type { Club } from "@/types/Club";

const { applyAuthTokenInterceptor } = useAxiosJwt();

const BASE_URL = getbaseURL();

export const apiClient = axios.create({ baseURL: BASE_URL });

const requestRefresh: TokenRefreshRequest = async (
  refreshToken: string
): Promise<IAuthTokens | string> => {
  const response = await axios.post(`${BASE_URL}users/token`, {
    token: refreshToken,
  });

  // If  backend supports rotating refresh tokens, you may also choose to return an object containing both tokens:
  // return {
  //  accessToken: response.data.access_token,
  //  refreshToken: response.data.refresh_token
  //}

  return response.data.accessToken;
};

applyAuthTokenInterceptor(apiClient, {
  requestRefresh,
  headerPrefix: "Bearer ", // header value prefix
});

export default {
  getFlights(params: FlightsFilterParams) {
    return apiClient.get("flights", { params });
  },
  getFlight(flightId: string) {
    return apiClient.get("flights/" + flightId);
  },
  deleteFlight(externalId: string) {
    return apiClient.delete("flights/" + externalId);
  },
  rerunFlightCalculation(flightId: string) {
    return apiClient.get("flights/admin/rerun/" + flightId);
  },
  fetchMetar(flightId: string) {
    return apiClient.get("flights/admin/fetch-metar/" + flightId);
  },
  changeFlightProps(flightId: string, flightProps: Partial<Flight>) {
    return apiClient.put("flights/admin/change-prop/" + flightId, flightProps);
  },
  uploadIgcAdmin(data: FormData) {
    return apiClient.post("flights/admin/upload/", data);
  },
  uploadIgc(data: FormData) {
    return apiClient.post("flights/", data);
  },
  updateFlightDetails(flightId: string, data: ModifiedFlightData) {
    return apiClient.put("flights/" + flightId, data);
  },

  // Photos

  uploadPhotos(data: FormData) {
    return apiClient.post("flights/photos/", data);
  },
  editPhoto(id: string, data: string) {
    return apiClient.put("flights/photos/" + id, data);
  },
  getInitialData() {
    return apiClient.get("home");
  },
  deletePhoto(id: string) {
    return apiClient.delete("flights/photos/" + id);
  },

  // Flight comments

  addComment(comment: NewComment) {
    return apiClient.post("comments", comment);
  },
  deleteComment(commentId: string) {
    return apiClient.delete("comments/" + commentId);
  },
  editComment(comment: Comment) {
    return apiClient.put("comments/" + comment.id, comment);
  },
  getCommentsOfFlight(flightId: string) {
    return apiClient.get("comments/flight/" + flightId);
  },

  // Profile

  getUserDetails() {
    return apiClient.get("users/");
  },
  updateUserProfile(userProfile: UserData) {
    return apiClient.put("users/", userProfile);
  },
  deleteProfil() {
    return apiClient.delete("users/");
  },
  deactivateProfil() {
    return apiClient.put("users/deactivate/");
  },
  getGliders(userId?: string) {
    return userId
      ? apiClient.get("users/gliders/get/" + userId)
      : apiClient.get("users/gliders/get");
  },
  setDefaultGlider(gliderId: string) {
    return apiClient.put("users/gliders/default/" + gliderId);
  },
  addGlider(glider: Glider) {
    return apiClient.post("users/gliders/add", glider);
  },
  removeGlider(gliderId: string) {
    return apiClient.delete("users/gliders/remove/" + gliderId);
  },
  uploadUserPicture(data: FormData) {
    return apiClient.post("users/picture/", data);
  },
  deleteUserPicture() {
    return apiClient.delete("users/picture/");
  },

  // Mail

  // sendMailToAll(mail) {
  //   return apiClient.post("mail/all", mail);
  // },

  sendMailToSingleUser(mail: Mail) {
    return apiClient.post("mail/single", mail);
  },

  // Admin

  getAdminNotifications() {
    return apiClient.get("users/adminNotifications");
  },
  getTShirtList(year = new Date().getFullYear()) {
    return apiClient.get("users/tshirts/" + year);
  },
  createPhotoArchivOfYear(year = new Date().getFullYear()) {
    return apiClient.get("flights/photos/create-archive/" + year);
  },
  getUserEmails(includeAll: boolean) {
    return apiClient.get("users/emails/" + includeAll);
  },
  getCacheStats() {
    return apiClient.get("cache/stats");
  },
  deleteCache(key: string) {
    return apiClient.get("cache/clear/" + key);
  },
  getFlightViolations() {
    return apiClient.get("flights/violations");
  },
  getFlightsSelf(params: FlightsFilterParams) {
    return apiClient.get("flights/self", { params });
  },
  acceptFlightViolations(flightId: string) {
    return apiClient.put("flights/acceptViolation/" + flightId);
  },
  rejectFlightViolations(externalId: string, message?: string) {
    return apiClient.put("flights/rejectViolation/" + externalId, { message });
  },
  getAllNews() {
    return apiClient.get("news/");
  },
  getPublicNews() {
    return apiClient.get("news/public/");
  },
  addNews(news: CreateNews) {
    return apiClient.post("news/", news);
  },
  editNews(news: News) {
    return apiClient.put("news/" + news.id, news);
  },
  deleteNews(newsId: string) {
    return apiClient.delete("news/" + newsId);
  },
  getLatestSeason() {
    return apiClient.get("seasons/latest");
  },
  createNewSeason(season: SeasonDetail) {
    return apiClient.post("seasons/", season);
  },
  updateSeason(seasonId: number, seasonData: SeasonDetail) {
    return apiClient.put("seasons/" + seasonId, seasonData);
  },

  // Results

  getResultsOverall(params: OverallFilterParams) {
    return apiClient.get("results/", {
      params,
    });
  },
  getResultsNewcomer(params: NewcomerFilterParams) {
    return apiClient.get("results/newcomer", {
      params,
    });
  },
  getResultsSeniors(params: SeniorsFilterParams) {
    return apiClient.get("results/seniors", {
      params,
    });
  },
  getResultsReynoldsClass(params: ReynoldsClassFilterParams) {
    return apiClient.get("results/reynolds-class", {
      params,
    });
  },
  getResultsLadies(params: OverallLadiesFilterParams) {
    return apiClient.get("results/?gender=F", {
      params,
    });
  },
  getResultsLux(params: LuxFilterParams) {
    return apiClient.get("results/state/LUX", {
      params,
    });
  },
  getResultsRlp(params: RlpFilterParams) {
    return apiClient.get("results/state/RP", {
      params,
    });
  },
  getResultsTeams(params: ResultsTeamsFilterParams) {
    return apiClient.get("results/teams", {
      params,
    });
  },
  getResultsClubs(params: ClubsFilterParams) {
    return apiClient.get("results/clubs", {
      params,
    });
  },
  getResultsEarlybird(params: ResultsEarlyBirdFilterParams) {
    return apiClient.get("results/earlybird", {
      params,
    });
  },
  getResultsLatebird(params: ResultsLateBirdFilterParams) {
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
    return apiClient.post("users/", userData);
  },

  getUsers(params: UserFilterParams) {
    return apiClient.get("users/public/", { params });
  },

  getUser(userId: string) {
    return apiClient.get("users/public/" + userId);
  },

  activate(userId: string, token: string) {
    return apiClient.get(`users/activate?userId=${userId}&token=${token}`);
  },

  requestNewPassword(email: string) {
    return apiClient.post(`users/request-new-password`, { email: email });
  },

  changePassword(password: string) {
    return apiClient.put("users/change-password", {
      password,
    });
  },

  confirmNewPassword(userId: string, token: string) {
    return apiClient.get(
      `users/renew-password?userId=${userId}&token=${token}`
    );
  },

  changeEmail(email: string) {
    return apiClient.put("users/change-email", {
      email,
    });
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
      ? apiClient.get("/sponsors")
      : apiClient.get("/sponsors/public");
  },

  addSponsor(sponsor: Sponsor) {
    return apiClient.post("/sponsors/", sponsor);
  },

  editSponsor(sponsor: Sponsor) {
    return apiClient.put("/sponsors/" + sponsor.id, sponsor);
  },

  deleteSponsor(id: string) {
    return apiClient.delete("/sponsors/" + id);
  },

  addSponsorLogo(data: FormData) {
    return apiClient.post("/sponsors/logo/", data);
  },

  deleteSponsorLogo(id: string) {
    return apiClient.delete("/sponsors/logo/" + id);
  },

  // Clubs

  /**
   * @param {Boolean} retrieveAll If set to true all data - including non public ones - will be retrieved. The user needs to have an "elevated" role to use the option "retrieveAll".
   * @returns An array with club objects.
   */
  getClubs(retrieveAll: boolean) {
    return retrieveAll
      ? apiClient.get("/clubs")
      : apiClient.get("/clubs/public");
  },

  getClubNames() {
    return apiClient.get("clubs/names/");
  },

  addClub(club: Club) {
    return apiClient.post("/clubs/", club);
  },

  editClub(club: Club) {
    return apiClient.put("/clubs/" + club.id, club);
  },

  deleteClub(id: string) {
    return apiClient.delete("/clubs/" + id);
  },

  addClubLogo(data: FormData) {
    return apiClient.post("/clubs/logo/", data);
  },

  deleteClubLogo(id: string) {
    return apiClient.delete("/clubs/logo/" + id);
  },

  // Teams

  getTeamNames() {
    return apiClient.get("teams/names/");
  },

  getTeams(params: TeamsFilterParams) {
    return apiClient.get("teams/", { params });
  },

  getUserWithoutTeam() {
    return apiClient.get("teams/availableUsers/");
  },

  addTeam(data: { name: string; memberIds: string[] }) {
    return apiClient.post("teams/", data);
  },

  // FlyingSites

  addSite(data: FlyingSite) {
    return apiClient.post("sites/", data);
  },

  getSiteNames() {
    return apiClient.get("sites/names/");
  },

  getSites() {
    return apiClient.get("sites");
  },

  getSitesProposed() {
    return apiClient.get("sites/proposed");
  },

  acceptSite(id: string) {
    return apiClient.put("sites/accept/" + id);
  },

  deleteSite(id: string) {
    return apiClient.delete("sites/" + id);
  },

  // General
  getCurrentSeason() {
    return apiClient.get("seasons/current");
  },
  getBrands() {
    return apiClient.get("general/brands");
  },
  getGliderClasses() {
    return apiClient.get("general/gliderClasses");
  },
  getRankingClasses() {
    return apiClient.get("general/rankingClasses");
  },
  getAirspaces(query: string) {
    return apiClient.get("airspaces/relevant", {
      params: { p: query },
    });
  },
  getUserProfileConstants() {
    return apiClient.get("general/user/constants");
  },
  getFilterOptions() {
    return apiClient.get("general/filterOptions");
  },
};
