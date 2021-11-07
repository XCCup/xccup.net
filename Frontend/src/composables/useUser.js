import { reactive, readonly, toRefs, computed } from "@vue/reactivity";
import { jwtDecrypt, tokenAlive } from "@/shared/jwtHelper";
import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL;

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

  const getLoginStatus = computed(() => state.loginStatus);
  const getUserId = computed(() => state.authData.userId);

  // const getAuthData = computed(() => state.authData);
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
  };

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
  const login = async (payload) => {
    const response = await axios
      .post(baseURL + "users/login", payload)
      .catch((err) => {
        console.log(err);
      });
    if (response && response.data) {
      saveTokenData(response.data);
      setLoginStatus("success");
      console.log("login successful");
    } else {
      setLoginStatus("failed");
      console.log("login failed");
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    await axios
      .post(baseURL + "users/logout", { token: accessToken })
      .catch((err) => {
        console.log(err);
      });
    logoutUser();
    console.log("Logged out");
  };

  const refresh = async () => {
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
    getLoginStatus,
    ...toRefs(readonly(state)),
    getUserId,
    isTokenActive,
    login,
    logout,
    saveTokenData,
    setLoginStatus,
    refresh,
    // state: readonly(state),
  };
};
