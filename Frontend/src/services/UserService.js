import jwtInterceptor from "@/shared/jwtInterceptor";

let baseURL = process.env.VUE_APP_API_URL;

export default {
  getUserDetails(userId) {
    return jwtInterceptor.get(baseURL + "/users/" + userId);
  },
};
