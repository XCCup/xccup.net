import { ref } from "vue";
import { useRoute } from "vue-router";
import ApiService from "@/services/ApiService";

export default () => {
  let sortOptionsCache;
  let filterOptionsCache;

  const route = useRoute();

  // Getters
  const flights = ref([]);
  const filterActive = ref(false);

  // Mutations
  const updateFlights = async ({ sortOptions, filterOptions } = {}) => {
    sortOptionsCache = sortOptions;
    filterOptionsCache = filterOptions;
    retrieveFlights();
    calcFilterActive();
  };

  // Actions
  const retrieveFlights = async () => {
    try {
      const { data: initialData } = await ApiService.getFlights({
        ...route.params,
        sortCol: sortOptionsCache?.sortCol,
        sortOrder: sortOptionsCache?.sortOrder,
        ...filterOptionsCache,
      });
      flights.value = initialData;
    } catch (error) {
      console.log(error);
    }
  };

  retrieveFlights();

  function calcFilterActive() {
    filterActive.value =
      filterOptionsCache && Object.values(filterOptionsCache).find((v) => !!v);
  }

  return { flights, updateFlights, filterActive };
};
