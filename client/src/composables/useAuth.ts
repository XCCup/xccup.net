import { computed } from "@vue/reactivity";
import { getbaseURL } from "@/helper/baseUrlHelper";
import { useJwt } from "@vueuse/integrations/useJwt";

import useAxiosJwt from "@/composables/useAxiosJwt";

import { apiClient } from "../services/ApiService";

import type { JwtPayload } from "jwt-decode";
import type { ComputedRef } from "vue-demi";

interface AuthData extends JwtPayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  gender?: string;
}

const {
  isLoggedIn,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} = useAxiosJwt();

const ADMIN_ROLE = "Administrator";
const MODERATOR_ROLE = "Moderator";

const baseURL = getbaseURL();

export default () => {
  // Getters
  const loggedIn = computed((): boolean => isLoggedIn.value);
  const getUserId = computed((): string | undefined => getAuthData.value.id);
  const getAuthData = computed((): AuthData => decodeJwt(getAccessToken.value));

  const hasElevatedRole = computed((): boolean => {
    const role = getAuthData.value.role;
    return role === ADMIN_ROLE || role === MODERATOR_ROLE;
  });
  const isAdmin = computed((): boolean => {
    return getAuthData.value.role === ADMIN_ROLE;
  });
  const isModerator = computed((): boolean => {
    return getAuthData.value.role === MODERATOR_ROLE;
  });

  const decodeJwt = (token?: string): AuthData => {
    if (!token) return {};
    const { payload }: { payload: ComputedRef<AuthData> } = useJwt(token);
    return payload.value;
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post("users/login", {
      email,
      password,
    });

    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response;
  };

  const logout = async () => {
    const refreshToken = getRefreshToken.value;
    await apiClient
      .post(baseURL + "users/logout", { token: refreshToken })
      .catch((err) => {
        console.log(err);
      });
    clearAuthTokens();
  };

  return {
    loggedIn,
    getAuthData,
    getUserId,
    hasElevatedRole,
    isAdmin,
    isModerator,
  };
};
