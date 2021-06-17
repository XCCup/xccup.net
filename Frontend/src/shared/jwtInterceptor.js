import axios from "axios";
import store from "../store/index";

const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {
  const authData = store.getters["auth/getAuthData"];
  if (authData == null) {
    return config;
  }

  config.headers.common["Authorization"] = `Bearer ${authData.token}`;
  return config;
});

jwtInterceptor.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log("Interceptor refresh…");
    // TODO: Should the server error code be 403?
    if (error.response.status === 401 || error.response.data === "EXPIRED") {
      // const authData = store.getters["auth/getAuthData"];
      // const payload = {
      //   token: authData.refreshToken,
      // };

      // var response = await axios.post(
      //   "http://localhost:3000/users/token",
      //   payload
      // );
      // store.commit("auth/saveTokenData", {
      //   accessToken: response.data.accessToken,
      //   refreshToken: authData.refreshToken,
      // });
      await store.dispatch("auth/refresh");
      const authData = store.getters["auth/getAuthData"];
      error.config.headers["Authorization"] = `Bearer ${authData.token}`;
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
