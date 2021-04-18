import { createStore } from "vuex";

export default createStore({
  state: {
    // Hardcoded for development
    users: [{ name: "testUser", id: "testId" }],
    authId: "testId",
    markerMapPosition: {},
  },
  getters: {
    authUser: (state) => state.users.find((user) => user.id === state.authId),
    markerMapPosition() {
      return this.markerMapPosition;
    },
  },
  actions: {
    updateMarkerMapPosition(context, Position) {
      context.commit("setMarkerMapPosition", Position);
    },
  },
  mutations: {
    setMarkerMapPosition(state, Position) {
      state.markerMapPosition = Position;
    },
  },
});
