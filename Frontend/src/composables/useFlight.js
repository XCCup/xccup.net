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
  return { fetchOne, flight };
};
