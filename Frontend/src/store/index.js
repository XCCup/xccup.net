import { createStore } from "vuex";

export default createStore({
  state: {
    // Hardcoded for development
    users: [
      {
        name: "Steph",
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
        aircrafts: [
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
        id: "testId",
      },
    ],
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
