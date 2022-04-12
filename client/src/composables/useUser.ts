import { reactive, readonly, toRefs, computed } from "@vue/reactivity";
import axios from "axios";
import { getbaseURL } from "@/helper/baseUrlHelper";
import { useJwt } from "@vueuse/integrations/useJwt";

import {
  isLoggedIn,
  setAuthTokens,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
} from "axios-jwt";
import { apiClient } from "../services/ApiService";

import type { JwtPayload } from "jwt-decode";
import type { ComputedRef } from "vue-demi";

interface Payload extends JwtPayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  gender?: string;
}

interface State {
  authData: {
    token?: string;
    refreshToken?: string;
    tokenExp?: number;
    userId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    gender?: string;
  };
  loginStatus: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";
const LOGIN_STATE_SUCCESS = "success";
const USER_ROLE_NONE = "Keine";

// Enables helpfull logs to understand auth
const DEBUG = false;

const baseURL = getbaseURL();
const state = reactive<State>({
  authData: {
    token: "",
    // refreshToken: "",
    tokenExp: undefined,
    userId: "",
    firstName: "",
    lastName: "",
    role: "",
    gender: "",
  },
  loginStatus: "",
});

export default () => {
  // Getters
  const loggedIn = computed(() => state.loginStatus === LOGIN_STATE_SUCCESS);
  const getUserId = computed(() => state.authData.userId);
  const getGender = computed(() => state.authData.gender);
  const hasElevatedRole = computed(() => {
    return loggedIn.value && state.authData.role !== USER_ROLE_NONE;
  });

  // Mutations
  const saveTokenData = (data: TokenData) => {
    if (DEBUG) console.log("Save token data…");
    localStorage.setItem(ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
    const { payload }: { payload: ComputedRef<Payload> } = useJwt(
      data.accessToken
    );

    if (!payload.value) return;
    const newTokenData = {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExp: payload.value.exp,
      userId: payload.value.id,
      firstName: payload.value.firstName,
      lastName: payload.value.lastName,
      role: payload.value.role,
      gender: payload.value.gender,
    };
    state.authData = newTokenData;
    state.loginStatus = LOGIN_STATE_SUCCESS;
  };

  const logoutUser = () => {
    if (DEBUG) console.log("Logout user…");
    // localStorage.removeItem(ACCESS_TOKEN);
    // localStorage.removeItem(REFRESH_TOKEN);
    state.loginStatus = "";
    state.authData = {
      token: "",
      refreshToken: "",
      tokenExp: undefined,
      userId: "",
      firstName: "",
      lastName: "",
      role: "",
      gender: "",
    };
  };

  // Actions

  // This needs to be a function because "Date" is not observed in computed properties
  const isTokenActive = () => {
    if (!state.authData.tokenExp) return false;
    return Date.now() <= state.authData.tokenExp * 1000;
  };

  // const login = async (email: string, password: string) => {
  //   const response = await axios.post(baseURL + "users/login", {
  //     email,
  //     password,
  //   });
  //   saveTokenData(response.data);
  //   return response;
  // };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post("users/login", {
      email,
      password,
    });

    // save tokens to storage
    setAuthTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    await apiClient
      .post(baseURL + "users/logout", { token: refreshToken })
      .catch((err) => {
        console.log(err);
      });
    clearAuthTokens();
    logoutUser();
  };

  const updateTokens = async () => {
    if (DEBUG) console.log("Update tokens…");
    const authData = state.authData;
    if (localStorage.getItem(ACCESS_TOKEN)) {
      try {
        const refreshResponse = await axios.post(baseURL + "users/token", {
          token: localStorage.getItem(REFRESH_TOKEN),
        });
        saveTokenData({
          accessToken: refreshResponse.data.accessToken,
          refreshToken: localStorage.getItem(REFRESH_TOKEN) ?? "",
        });
        state.loginStatus = LOGIN_STATE_SUCCESS;
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
    getGender,
    isTokenActive,
    login,
    logout,
    saveTokenData,
    updateTokens,
  };
};
