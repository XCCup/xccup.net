import { reactive, readonly, toRefs, computed } from "@vue/reactivity";
import { jwtDecrypt, tokenAlive } from "@/helper/jwtHelper";
import axios from "axios";

import { getbaseURL } from "@/helper/baseUrlHelper";

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

  const isTokenActive = computed(() => {
    if (!state.authData.tokenExp) {
      return false;
    }
    return tokenAlive(state.authData.tokenExp);
  });

  // Mutations

  const saveTokenData = (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const jwtDecodedValue = jwtDecrypt(data.accessToken);
    const newTokenData = {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExp: jwtDecodedValue.exp,
      userId: jwtDecodedValue.id,
      firstName: jwtDecodedValue.firstName,
      lastName: jwtDecodedValue.lastName,
      role: jwtDecodedValue.role,
    };
    state.authData = newTokenData;
    setLoginStatus("success");
  };

  // TODO: Is this needed?
  const setLoginStatus = (value) => {
    state.loginStatus = value;
  };

  const logoutUser = () => {
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

  const refreshToken = async () => {
    const authData = state.authData;
    if (authData.token) {
      const payload = {
        token: authData.refreshToken,
      };
      try {
        const refreshResponse = await axios.post(
          baseURL + "users/token",
          payload
        );
        saveTokenData({
          accessToken: refreshResponse.data.accessToken,
          refreshToken: authData.refreshToken,
        });
        setLoginStatus("success");
        return true;
      } catch (error) {
        logout();
        console.log(error);
      }
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
    setLoginStatus,
    refreshToken,
  };
};
