import axios from "axios";
import useUser from "@/composables/useUser";
const { authData, refreshToken } = useUser();

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
    console.log("Interceptor refresh…");
    // TODO: Should the server error code be 403?
    if (error.response.status === 401 || error.response.data === "EXPIRED") {
      await refreshToken();
      error.config.headers["Authorization"] = `Bearer ${authData.value.token}`;
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
