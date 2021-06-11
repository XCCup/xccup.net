import { jwtDecrypt } from "../../shared/jwtHelper";
import { tokenAlive } from "../../shared/jwtHelper";
import axios from "axios";

let baseURL = "https://xccup.lurb.org/";

if (process.env.VUE_APP_USE_LOCAL_API === "true") {
  console.log("Using localhost:3000 for API calls");
  baseURL = "http://localhost:3000/";
}

const state = () => ({
  authData: {
    token: "",
    refreshToken: "",
    tokenExp: "",
    userId: "",
    username: "",
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
};
const actions = {
  async login({ commit }, payload) {
    try {
      const response = await axios.post(baseURL + "users/login", payload);
      if (response && response.data) {
        commit("saveTokenData", response.data);
        commit("setLoginStatus", "success");
      } else {
        commit("setLoginStatus", "failed");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
const mutations = {
  saveTokenData(state, data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const jwtDecodedValue = jwtDecrypt(data.accessToken);
    console.log(jwtDecodedValue);
    const newTokenData = {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExp: jwtDecodedValue.exp,
      userId: jwtDecodedValue.sub,
      username: jwtDecodedValue.username,
    };
    state.authData = newTokenData;
  },
  setLoginStatus(state, value) {
    state.loginStatus = value;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
