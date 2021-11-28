import { ref } from "vue";
import ApiService from "@/services/ApiService";

const flight = ref(null);

export default () => {
  // Getters

  // Mutations

  // Actions
  const fetchOne = async (flightId) => {
    flight.value = (await ApiService.getFlight(flightId)).data;
  };

  const updateComments = async () => {
    const res = await ApiService.getCommentsOfFlight(flight.value.id);
    if (res.status != 200) throw res.statusText;
    flight.value.comments = [...res.data];
  };

  //TODO: Make flight readOnly. Currently useComments manipulates the comment structur of flight. Therefore readOnly ist not possible
  return { fetchOne, flight, updateComments };
};
