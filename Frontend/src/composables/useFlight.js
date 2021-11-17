import { ref } from "vue";
import apiService from "@/services/ApiService";

const flight = ref(null);

export default () => {
  // Getters

  // Mutations

  // Actions
  const fetchOne = async (flightId) => {
    flight.value = (await apiService.getFlight(flightId)).data;
  };

  const updateComments = async () => {
    const res = await apiService.getCommentsOfFlight(flight.value.id);
    if (res.status != 200) throw res.statusText;
    flight.value.comments = [...res.data];
  };

  return { fetchOne, flight, updateComments };
};
