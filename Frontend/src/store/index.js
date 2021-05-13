import { createStore } from "vuex";

export default createStore({
  state: {
    // Hardcoded for development
    users: [
      {
        name: "User",
        surname: "foo",
        email: "foo@bar.org",
        sex: "männlich",
        club: "Good Club",
        birthday: "1.1.1970",
        country: "Deutschland",
        defaultAircraft: {
          brand: "Flow",
          model: "XCRacer S",
          listName: "Flow XCRacer S",
          rankingClass: "gsPerfomance",
          default: true,
        },
        gliders: [
          {
            brand: "Flow",
            model: "XCRacer S",
            rankingClass: "gsPerfomance",
            default: true,
          },
          {
            brand: "Ozone",
            model: "Enzo 3 S",
            rankingClass: "gsComp",
            default: false,
          },
        ],
        shirtSize: "M",
        id: "1332b2d1-2f47-4c09-c1d8-1a8f3d5e9a8e",
      },
    ],
    authId: "1332b2d1-2f47-4c09-c1d8-1a8f3d5e9a8e",
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
