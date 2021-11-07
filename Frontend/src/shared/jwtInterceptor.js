import axios from "axios";
import useUser from "@/composables/useUser";
const { authData, refresh } = useUser();

const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {
  const authData2 = authData.value;
  if (authData2 == null) {
    return config;
  }
  config.headers.common["Authorization"] = `Bearer ${authData2.token}`;
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
      const authData2 = authData.value;
      error.config.headers["Authorization"] = `Bearer ${authData2.token}`;
      console.log("…done");
      return axios(error.config);
    } else {
      return Promise.reject(error);
    }
  }
);

export default jwtInterceptor;
