import { createStore } from "vuex";

export default createStore({
  state: {
    // Hardcoded for development
    users: [{ name: "testUser", id: "testId" }],
    authId: "testId",
    mapPosition: { name: "test" },
  },
  getters: {
    authUser: (state) => state.users.find((user) => user.id === state.authId),
    mapPosition() {
      return this.mapPosition;
    },
  },
  actions: {
    updateMapPositions(context, positions) {
      context.commit("setMapPosition", positions);
    },
  },
  mutations: {
    setMapPositions(state, mapPositions) {
      state.mapPosition = mapPositions;
    },
  },
});
