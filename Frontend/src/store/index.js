import { createStore } from "vuex";

export default createStore({
  state: {
    // Hardcoded for development
    users: [{ name: "testUser", id: "testId" }],
    authId: "testId",
  },
  getters: {
    authUser: (state) => state.users.find((user) => user.id === state.authId),
  },
});
