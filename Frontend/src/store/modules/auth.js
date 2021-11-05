import { jwtDecrypt, tokenAlive } from "@/shared/jwtHelper";
import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL;

const state = () => ({
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

const getters = {
  getLoginStatus(state) {
    return state.loginStatus;
  },
  getAuthData(state) {
    return state.authData;
  },
  isTokenActive(state) {
    if (!state.authData.tokenExp) {
      return false;
    }
    return tokenAlive(state.authData.tokenExp);
  },
  getUserId(state) {
    return state.authData.userId;
  },
};

const actions = {
  async login({ commit }, payload) {
    const response = await axios
      .post(baseURL + "users/login", payload)
      .catch((err) => {
        console.log(err);
      });
    if (response && response.data) {
      commit("saveTokenData", response.data);
      commit("setLoginStatus", "success");
      console.log("login successful");
    } else {
      commit("setLoginStatus", "failed");
      console.log("login failed");
    }
  },
  async refresh({ commit, getters, dispatch }) {
    const authData = getters.getAuthData;
    if (authData.token) {
      const payload = {
        token: authData.refreshToken,
      };
      try {
        const refreshResponse = await axios.post(
          baseURL + "users/token",
          payload
        );
        commit("saveTokenData", {
          accessToken: refreshResponse.data.accessToken,
          refreshToken: authData.refreshToken,
        });
        commit("setLoginStatus", "success");
        return true;
      } catch (error) {
        dispatch("logout");
        console.log(error);
      }
    }
  },
  async logout({ commit }) {
    const accessToken = localStorage.getItem("accessToken");
    await axios
      .post(baseURL + "users/logout", { token: accessToken })
      .catch((err) => {
        console.log(err);
      });
    commit("logoutUser");
    console.log("Logged out");
  },
};

const mutations = {
  saveTokenData(state, data) {
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
  },
  setLoginStatus(state, value) {
    state.loginStatus = value;
  },
  logoutUser(state) {
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
  },
};

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations,
};
