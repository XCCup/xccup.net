import axios from "axios";

let baseURL = process.env.VUE_APP_API_URL;

export default {
  getUserDetails(userId) {
    return axios.get(baseURL + "users/" + userId);
  },
};
