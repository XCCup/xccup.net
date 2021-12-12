import { ref, readonly, computed } from "vue";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const DEFAULT_LIMIT = 50;

export default () => {
  let apiEndpoint;
  let apiExtension;

  const filterOptionsCache = ref({});
  const isLoading = ref(false);
  const data = ref([]);
  const paramsCache = ref(null);
  const limitCache = ref(DEFAULT_LIMIT);

  // Setters
  const setApiEndpoint = (endpoint, extension) => {
    (apiEndpoint = endpoint), (apiExtension = extension);
  };

  // Getters
  const filterActive = computed(() =>
    checkIfAnyValueOfObjectIsDefined(filterOptionsCache.value)
  );

  // Mutations
  const clearFilter = () => {
    filterOptionsCache.value = null;
    fetchResults();
  };
  const filterFlightsBy = (filterOptions) => {
    //Check if any filter value was set
    if (!Object.values(filterOptions).find((v) => !!v)) return;
    filterOptionsCache.value = filterOptions;
    fetchResults();
  };

  // Actions
  async function fetchResults({ params, queries, limit, offset = 0 } = {}) {
    if (params) paramsCache.value = params;
    if (queries) filterOptionsCache.value = queries;
    if (offset < 0) offset = 0;
    if (limit) limitCache.value = limit;
    try {
      isLoading.value = true;
      const res = await apiEndpoint(
        {
          ...paramsCache.value,
          limit,
          offset,
          ...filterOptionsCache.value,
        },
        apiExtension
      );
      if (res.status != 200) throw res.status.text;

      data.value = res.data;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading: readonly(isLoading),
    filterActive: readonly(filterActive),
    data: readonly(data),
    clearFilter,
    filterFlightsBy,
    setApiEndpoint,
    fetchResults,
  };
};
