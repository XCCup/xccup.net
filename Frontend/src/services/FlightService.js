import axios from "axios";

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
const apiClient2 = axios.create({
  baseURL:
    "https://my-json-server.typicode.com/KaiWissel/XCCup-2.0/blob/master",
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
  getPilots() {
    return apiClient2.get("/pilots");
  },
  getTageswertung() {
    return apiClient2.get("/tageswertung");
  },
  getGeraetewertung() {
    return apiClient2.get("/geraetewertung");
  },
  getComments() {
    return apiClient2.get("/comments");
  },
  getDescription() {
    return apiClient2.get("/flightDescription");
  },
};
