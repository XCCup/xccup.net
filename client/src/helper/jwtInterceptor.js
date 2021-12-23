import axios from "axios";
import useUser from "@/composables/useUser";
const { authData, updateTokens } = useUser();

const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {
  if (authData.value == null) {
    return config;
  }
  config.headers.common["Authorization"] = `Bearer ${authData.value.token}`;
  return config;
});

jwtInterceptor.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (!error.response) {
      console.log("Please check your internet connection.");
    }
    console.log("Interceptor refresh…");
    if (error.response?.status === 403 && error.response?.data === "EXPIRED") {
      console.log("Interceptor refresh…");
      await updateTokens();
      error.config.headers["Authorization"] = `Bearer ${authData.value.token}`;
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
