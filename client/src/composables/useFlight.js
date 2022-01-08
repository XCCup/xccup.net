import { ref, readonly } from "vue";
import ApiService from "@/services/ApiService";
import useAirbuddy from "@/composables/useAirbuddies";
const { resetAirbuddyData } = useAirbuddy();

const flight = ref(null);

export default () => {
  // Getters

  // Mutations

  // Actions
  const fetchOne = async (flightId) => {
    resetAirbuddyData();
    flight.value = (await ApiService.getFlight(flightId)).data;
  };

  const updateComments = async () => {
    const res = await ApiService.getCommentsOfFlight(flight.value.id);
    if (res.status != 200) throw res.statusText;
    flight.value.comments = [...res.data];
  };

  return { fetchOne, flight: readonly(flight), updateComments };
};
