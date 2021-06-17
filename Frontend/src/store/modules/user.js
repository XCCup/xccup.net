import jwtInterceptor from "@/shared/jwtInterceptor";

let baseURL = process.env.VUE_APP_API_URL;

const state = () => ({
  userDetails: {},
});

const getters = {
  getUserDetails(state) {
    return state.userDetails;
  },
};

const actions = {
  async getUserDetails({ commit }, userID) {
    if (!userID) return;
    var response = await jwtInterceptor.get(baseURL + "users/" + userID);
    if (response && response.data) {
      commit("setUserDetails", response.data);
    }
  },
};

const mutations = {
  setUserDetails(state, payload) {
    state.userDetails = payload;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
