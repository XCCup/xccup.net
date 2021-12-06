import { ref, readonly, computed } from "vue";
import ApiService from "@/services/ApiService";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 25, 50, 100];

// State
const flights = ref([]);
const sortOptionsCache = ref(null);
const filterOptionsCache = ref(null);
const paramsCache = ref(null);
const limitCache = ref(DEFAULT_LIMIT);
const numberOfTotalFlights = ref(0);
const currentRange = ref({ start: 0, end: 0 });
const isLoading = ref(false);

export default () => {
  // Getters

  const filterActive = computed(() => {
    return (
      filterOptionsCache.value &&
      Object.values(filterOptionsCache.value).find((v) => !!v)
    );
  });

  // Mutations

  // Actions

  const fetchFlights = async ({ params, queries, limit, offset = 0 } = {}) => {
    if (params) paramsCache.value = params;
    if (queries) filterOptionsCache.value = queries;
    if (offset < 0) offset = 0;
    if (limit) limitCache.value = limit;

    try {
      isLoading.value = true;
      const res = await ApiService.getFlights({
        ...paramsCache.value,
        sortCol: sortOptionsCache.value?.sortCol,
        sortOrder: sortOptionsCache.value?.sortOrder,
        ...filterOptionsCache.value,
        limit: limitCache.value,
        offset,
      });
      if (res.status != 200) throw res.statusText;
      flights.value = res.data.rows;

      numberOfTotalFlights.value = res.data.count;
      calcRanges(offset);
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
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

  function calcRanges(offset) {
    currentRange.value.start = offset + 1;
    currentRange.value.end =
      currentRange.value.start + limitCache.value - 1 >=
      numberOfTotalFlights.value
        ? numberOfTotalFlights.value
        : currentRange.value.start + limitCache.value - 1;
  }

  return {
    fetchFlights,
    filterFlightsBy,
    sortFlightsBy,
    flights: readonly(flights),
    currentRange: readonly(currentRange),
    numberOfTotalFlights: readonly(numberOfTotalFlights),
    isLoading: readonly(isLoading),
    filterActive,
    clearFilter,
    DEFAULT_LIMIT,
    LIMIT_OPTIONS,
  };
};
