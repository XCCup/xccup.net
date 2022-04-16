import axios, { type AxiosRequestConfig } from "axios";
import useUser from "@/composables/useUser";
import router from "@/router/";

const { updateTokens } = useUser();

const jwtInterceptor = axios.create({});
// TODO: Merge with apiClient
jwtInterceptor.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token == null || !config.headers) {
    return config;
  }

  config.headers["Authorization"] = "Bearer " + token;

  return config;
});
jwtInterceptor.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    //  Only route to network error page if it's a get request.
    if (error.message === "Network Error" && error.config.method === "get") {
      console.log("Network Error");
      router.push({
        name: "NetworkError",
      });
    }

    // Token refresh
    if (error.response?.status === 403 && error.response?.data === "EXPIRED") {
      console.log("Interceptor refresh…");
      await updateTokens();
      error.config.headers["Authorization"] =
        "Bearer " + localStorage.getItem("accessToken");
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
