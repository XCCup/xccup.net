import axios from "axios";
import store from "@/store/index";

let baseURL = process.env.VUE_APP_API_URL;

const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {
  const authData = store.getters["auth/getAuthData"];
  if (authData == null) {
    return config;
  }
  config.headers.common["Authorization"] = `bearer ${authData.token}`;
  return config;
});

jwtInterceptor.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      const authData = store.getters["auth/getAuthData"];
      const payload = {
        access_token: authData.token,
        refresh_token: authData.refreshToken,
      };
      var response = await axios.post(baseURL + "users/token", payload);
      await store.dispatch("auth/saveTokensToStorage", response.data);
      error.config.headers[
        "Authorization"
      ] = `bearer ${response.data.access_token}`;
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
