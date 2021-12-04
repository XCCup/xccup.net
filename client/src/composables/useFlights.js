import { ref, readonly, computed } from "vue";
import ApiService from "@/services/ApiService";

const DEFAULT_LIMIT = 25;
const LIMIT_OPTIONS = [10, 25, 50, 100];

// State
const flights = ref([]);
const sortOptionsCache = ref(null);
const filterOptionsCache = ref(null);
const paramsCache = ref(null);
const numberOfTotalFlights = ref(0);
const currentRange = ref({ start: 0, end: 0 });

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

  const fetchFlights = async ({
    params,
    queries,
    limit = DEFAULT_LIMIT,
    offset = 0,
  } = {}) => {
    if (params) paramsCache.value = params;
    if (queries) filterOptionsCache.value = queries;
    if (offset < 0) offset = 0;

    try {
      const res = await ApiService.getFlights({
        ...paramsCache.value,
        sortCol: sortOptionsCache.value?.sortCol,
        sortOrder: sortOptionsCache.value?.sortOrder,
        ...filterOptionsCache.value,
        limit,
        offset,
      });
      if (res.status != 200) throw res.statusText;
      flights.value = res.data.rows;

      numberOfTotalFlights.value = res.data.count;
      calcRanges(limit, offset);
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

  function calcRanges(limit, offset) {
    currentRange.value.start = offset + 1;
    currentRange.value.end =
      currentRange.value.start + limit - 1 >= numberOfTotalFlights.value
        ? numberOfTotalFlights.value
        : currentRange.value.start + limit - 1;
  }

  return {
    fetchFlights,
    filterFlightsBy,
    sortFlightsBy,
    flights: readonly(flights),
    currentRange: readonly(currentRange),
    numberOfTotalFlights: readonly(numberOfTotalFlights),
    filterActive,
    clearFilter,
    DEFAULT_LIMIT,
    LIMIT_OPTIONS,
  };
};
