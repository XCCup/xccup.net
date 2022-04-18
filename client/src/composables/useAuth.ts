import { computed } from "@vue/reactivity";
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

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";
const LOGIN_STATE_SUCCESS = "success";

const ADMIN_ROLE = "Administrator";
const MODERATOR_ROLE = "Moderator";

// Enables helpfull logs to understand auth
const DEBUG = import.meta.env.MODE === "development";

const baseURL = getbaseURL();

export default () => {
  // Getters
  const loggedIn = computed(() => isLoggedIn());
  const getAuthData = computed(() => decodeJwt());
  const hasElevatedRole = computed(() => {
    const role = decodeJwt().role;
    return role === ADMIN_ROLE || role === MODERATOR_ROLE;
  });

  const decodeJwt = () => {
    const token = getAccessToken();
    if (!token) return {};
    const { payload }: { payload: ComputedRef<Payload> } = useJwt(token);
    return payload.value;
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post("users/login", {
      email,
      password,
    });

    // save tokens to storage
    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response;
  };

  const logout = async () => {
    // const refreshToken = getRefreshToken();
    // await apiClient
    //   .post(baseURL + "users/logout", { token: refreshToken })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    clearAuthTokens();
  };

  return {
    loggedIn,
    hasElevatedRole,
    getAuthData,
    login,
    logout,
  };
};
