import { ref, readonly } from "vue";
import ApiService from "@/services/ApiService";
import useAirbuddy from "@/composables/useAirbuddies";
import type { Flight } from "@/types/Flight";

const { resetAirbuddyData } = useAirbuddy();

const flight = ref<Flight | null>(null);

export default () => {
  // Getters

  // Mutations

  // Actions
  const fetchOne = async (flightId: string) => {
    resetAirbuddyData();
    flight.value = (await ApiService.getFlight(flightId)).data;
  };

  const updateComments = async () => {
    if (!flight.value?.id) return;
    const res = await ApiService.getCommentsOfFlight(flight.value.id);
    if (res.status != 200) throw res.statusText;
    flight.value.comments = [...res.data];
  };

  return { fetchOne, flight: readonly(flight), updateComments };
};
