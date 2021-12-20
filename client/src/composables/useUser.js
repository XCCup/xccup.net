import { reactive, readonly, toRefs, computed } from "@vue/reactivity";
import axios from "axios";
import { getbaseURL } from "@/helper/baseUrlHelper";
import { useJwt } from "@vueuse/integrations/useJwt";

// Enables helpfull logs to understand auth
const DEBUG = false;

const baseURL = getbaseURL();
const state = reactive({
  authData: {
    token: "",
    refreshToken: "",
    tokenExp: "",
    userId: "",
    firstName: "",
    lastName: "",
    role: "",
  },
  loginStatus: "",
});

export default () => {
  // Getters

  const loggedIn = computed(() => state.loginStatus === "success");
  const getUserId = computed(() => state.authData.userId);
  const hasElevatedRole = computed(() => {
    return loggedIn.value && state.authData.role !== "Keine";
  });

  // Mutations

  const saveTokenData = (data) => {
    if (DEBUG) console.log("Save token data…");
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const { payload } = useJwt(data.accessToken);
    const newTokenData = {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExp: payload.value.exp,
      userId: payload.value.id,
      firstName: payload.value.firstName,
      lastName: payload.value.lastName,
      role: payload.value.role,
    };
    state.authData = newTokenData;
    state.loginStatus = "success";
  };

  const logoutUser = () => {
    if (DEBUG) console.log("Logout user…");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    state.loginStatus = "";
    state.authData = {
      token: "",
      refreshToken: "",
      tokenExp: "",
      userId: "",
      firstName: "",
      lastName: "",
      role: "",
    };
  };

  // Actions

  // This needs to be a function because "Date" is not observed in computed properties
  const isTokenActive = () => {
    if (!state.authData.tokenExp) return false;
    return Date.now() <= state.authData.tokenExp * 1000;
  };

  const login = async (credentials) => {
    const response = await axios.post(baseURL + "users/login", credentials);
    saveTokenData(response.data);
    return response;
  };

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    await axios
      .post(baseURL + "users/logout", { token: accessToken })
      .catch((err) => {
        console.log(err);
      });
    logoutUser();
  };

  const updateTokens = async () => {
    if (DEBUG) console.log("Update tokens…");
    const authData = state.authData;
    if (authData.token) {
      try {
        const refreshResponse = await axios.post(baseURL + "users/token", {
          token: authData.refreshToken,
        });
        saveTokenData({
          accessToken: refreshResponse.data.accessToken,
          refreshToken: authData.refreshToken,
        });
        state.loginStatus = "success";
        if (DEBUG) console.log("…tokens:", authData);
      } catch (error) {
        logoutUser();
        console.log(error);
      }
    } else {
      logoutUser();
    }
  };

  return {
    loggedIn,
    hasElevatedRole,
    ...toRefs(readonly(state)),
    getUserId,
    isTokenActive,
    login,
    logout,
    saveTokenData,
    updateTokens,
  };
};
