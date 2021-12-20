import { ref } from "vue";

// This is a simple state

const modifiedFlightData = ref({
  externalId: null,
  glider: { id: "" },
  report: "",
  airspaceComment: "",
  hikeAndFly: false,
  onlyLogbook: false,
  photos: [],
});

let unmodifiedFlightData = ref(null);

export default () => {
  // Getters

  // Mutations

  // Actions
  const resetState = () => {
    modifiedFlightData.value = {
      glider: { id: "" },
      report: "",
      airspaceComment: "",
      hikeAndFly: false,
      onlyLogbook: false,
      photos: [],
    };
    unmodifiedFlightData.value = null;
  };

  return { modifiedFlightData, unmodifiedFlightData, resetState };
};
