import jwtInterceptor from "@/shared/jwtInterceptor";

let baseURL = process.env.VUE_APP_BASE_URL;

if (process.env.VUE_APP_USE_LOCAL_API === "true") {
  console.log("Using localhost:3000 for API calls");
  baseURL = "http://localhost:3000";
}

export default {
  getUserDetails(userId) {
    return jwtInterceptor.get(baseURL + "/users/" + userId);
  },
};
