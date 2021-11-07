import axios from "axios";
import useUser from "@/composables/useUser";
const { getAuthData, refresh } = useUser();

const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {
  const authData = getAuthData;
  if (authData == null) {
    return config;
  }
  console.log(getAuthData);
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
      await refresh();
      const authData = getAuthData;
      error.config.headers["Authorization"] = `Bearer ${authData.token}`;
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
