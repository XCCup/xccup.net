import { ref, readonly, computed } from "vue";
import ApiService from "@/services/ApiService";

// State
const flights = ref([]);

export default () => {
  const sortOptionsCache = ref(null);
  const filterOptionsCache = ref(null);
  const paramsCache = ref(null);

  // Getters

  const filterActive = computed(() => {
    // if (filterOptionsCache.value) return true;
    // return false;
    return (
      filterOptionsCache.value &&
      Object.values(filterOptionsCache.value).find((v) => !!v)
    );
  });

  // Mutations

  // Actions

  const fetchFlights = async (params) => {
    if (params) paramsCache.value = params;
    try {
      const res = await ApiService.getFlights({
        ...paramsCache.value,
        sortCol: sortOptionsCache.value?.sortCol,
        sortOrder: sortOptionsCache.value?.sortOrder,
        ...filterOptionsCache.value,
      });
      if (res.status != 200) throw res.statusText;
      flights.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const sortFlightsBy = async (sortOptions) => {
    sortOptionsCache.value = sortOptions;
    await fetchFlights();
  };

  const filterFlightsBy = async (filterOptions) => {
    filterOptionsCache.value = filterOptions;
    await fetchFlights();
  };

  const clearFilter = async () => {
    filterOptionsCache.value = null;
    await fetchFlights();
  };

  return {
    fetchFlights,
    filterFlightsBy,
    sortFlightsBy,
    flights: readonly(flights),
    filterActive,
    clearFilter,
  };
};
