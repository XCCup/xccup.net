import { ref, readonly, computed } from "vue";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 25, 50, 100];

const instances = {};

export default (apiEndpoint) => {
  if (!apiEndpoint) throw "No endpoint defined for useData";

  if (!instances[apiEndpoint])
    instances[apiEndpoint] = createInstance(apiEndpoint);

  return instances[apiEndpoint];
};

function createInstance(apiEndpoint) {
  const data = ref(null);
  const sortOptionsCache = ref(null);
  const filterOptionsCache = ref(null);
  const paramsCache = ref(null);
  const limitCache = ref(DEFAULT_LIMIT);
  const numberOfTotalEntries = ref(0);
  const isLoading = ref(false);
  const currentRange = ref({ start: 0, end: 0 });
  const errorMessage = ref(null);

  // Getters
  const filterActive = computed(() =>
    checkIfAnyValueOfObjectIsDefined(filterOptionsCache.value)
  );

  const activeFilters = computed(() => {
    if (!filterOptionsCache.value) return;
    return Object.keys(filterOptionsCache.value)
      .filter((k) => filterOptionsCache.value[k] != null)
      .reduce((a, k) => ({ ...a, [k]: filterOptionsCache.value[k] }), {});
  });

  // Mutations
  const clearFilter = () => {
    filterOptionsCache.value = null;
    fetchData();
  };

  const clearOneFilter = (key) => {
    delete filterOptionsCache.value[key];
    fetchData();
  };

  const sortDataBy = async (sortOptions) => {
    sortOptionsCache.value = sortOptions;
    fetchData();
  };

  const filterDataBy = (filterOptions) => {
    filterOptionsCache.value = filterOptions;
    fetchData();
  };

  // Actions
  const fetchData = async ({ params, queries, limit, offset = 0 } = {}) => {
    try {
      if (params) paramsCache.value = params;
      if (queries) filterOptionsCache.value = queries;
      if (offset < 0) offset = 0;
      if (limit) limitCache.value = limit;
      isLoading.value = true;
      const res = await apiEndpoint({
        ...paramsCache.value,
        ...filterOptionsCache.value,
        sortCol: sortOptionsCache.value?.sortCol,
        sortOrder: sortOptionsCache.value?.sortOrder,
        limit: limitCache.value,
        offset,
      });
      if (res.status != 200) throw res.status.text;

      // TODO: What is the intention here?
      if (!res?.data) return;

      // Check if data supports pagination (data split in rows and count)
      if (res.data.rows) {
        data.value = res.data.rows;
        numberOfTotalEntries.value = res.data.count;
        calcRanges(offset);
      } else {
        data.value = res?.data;
      }
    } catch (error) {
      console.error(error);
      if (error.response.status === 422) {
        data.value = "NO_DATA";
        return;
      }
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const calcRanges = (offset) => {
    currentRange.value.start = offset + 1;
    currentRange.value.end =
      currentRange.value.start + limitCache.value - 1 >=
      numberOfTotalEntries.value
        ? numberOfTotalEntries.value
        : currentRange.value.start + limitCache.value - 1;
  };

  return {
    fetchData,
    filterDataBy,
    sortDataBy,
    data: readonly(data),
    errorMessage,
    currentRange: readonly(currentRange),
    numberOfTotalEntries: readonly(numberOfTotalEntries),
    isLoading: readonly(isLoading),
    filterActive: readonly(filterActive),
    activeFilters,
    clearFilter,
    clearOneFilter,
    DEFAULT_LIMIT,
    LIMIT_OPTIONS,
  };
}
