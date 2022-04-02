import { ref, readonly } from "vue";
import { useRouter, useRoute } from "vue-router";

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 25, 50, 100];

const instances = {};

export default () => {
  const route = useRoute();

  const viewComponentName = route.name;
  if (!viewComponentName)
    throw "There was an error assigning the route name to this useData instance";

  if (!instances[viewComponentName])
    instances[viewComponentName] = createInstance(viewComponentName);

  return instances[viewComponentName];
};

function createInstance(viewComponentName) {
  const data = ref(null);
  const queryCache = ref({});
  const limitCache = ref(DEFAULT_LIMIT);
  const numberOfTotalEntries = ref(0);
  const isLoading = ref(false);
  const currentRange = ref({ start: 1, end: DEFAULT_LIMIT });
  const errorMessage = ref(null);
  const noDataFlag = ref(false);
  const dataConstants = ref(null);
  let apiEndpoint = null;

  const router = useRouter();

  const filterBlackList = [
    "offset",
    "limit",
    "year",
    "sortOrder",
    "sortCol",
    "records",
  ];
  // We tried to implement activeFilters/filterActive as computed values. But due to some nested (?) stuff the update doesn't work as expected.
  // The calculation of these values was therefore moved to the fetchData function.
  const activeFilters = ref([]);
  const filterActive = ref(false);

  // Mutations
  const clearOneFilter = (key) => {
    delete queryCache.value[key];
    fetchData();
  };

  const sortDataBy = async (sortOptions) => {
    queryCache.value.sortCol = sortOptions.sortCol;
    queryCache.value.sortOrder = sortOptions.sortOrder;
    fetchData();
  };

  const selectSeason = async (year) => {
    // This call reloads the view and which leads to a new initData call. The year param will then be stored in queryCache again.
    router.push({
      name: viewComponentName,
      params: { year },
    });
  };

  const filterDataBy = (filterOptions) => {
    queryCache.value = {
      ...queryCache.value,
      ...filterOptions,
    };
    fetchData();
  };

  const paginateBy = async (limit, offset) => {
    queryCache.value.limit = parseInt(limit);
    queryCache.value.offset = offset > 0 ? parseInt(offset) : 0;
    calcRanges();

    fetchData();
  };
  // Actions
  const initData = async (apiEndpointFunction, { queryParameters } = {}) => {
    queryCache.value = queryParameters;
    // Add default limit if none is present
    if (!queryParameters.limit) queryCache.value.limit = DEFAULT_LIMIT;
    apiEndpoint = apiEndpointFunction;
    await fetchData();
  };

  // Actions
  const fetchData = async () => {
    try {
      isLoading.value = true;
      const res = await apiEndpoint(queryCache.value);
      calcFilterActive();
      calcActiveFilters();

      if (res.status != 200) throw res.status.text;

      // Check if data supports pagination (data split in rows and count)
      if (res.data.rows) {
        data.value = res.data.rows;
        numberOfTotalEntries.value = res.data.count;
      }
      if (res.data.values) {
        data.value = res.data.values;
      }
      if (res.data.constants) {
        dataConstants.value = res.data.constants;
      }
      noDataFlag.value = false;
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 422 || error?.response?.status === 404) {
        // Mimic empty response
        data.value = [];
        noDataFlag.value = true;
        return;
      }
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const calcRanges = () => {
    currentRange.value.start = queryCache.value.offset + 1;
    currentRange.value.end =
      currentRange.value.start + limitCache.value - 1 >=
      numberOfTotalEntries.value
        ? numberOfTotalEntries.value
        : currentRange.value.start + limitCache.value - 1;
  };

  function calcFilterActive() {
    filterActive.value =
      Object.keys(queryCache.value)
        .filter((k) => queryCache.value[k] != undefined)
        .filter((k) => !filterBlackList.includes(k)).length > 0;
  }

  function calcActiveFilters() {
    activeFilters.value = Object.keys(queryCache.value)
      .filter((k) => queryCache.value[k] != undefined)
      .filter((k) => !filterBlackList.includes(k))
      .reduce((a, k) => ({ ...a, [k]: queryCache.value[k] }), {});
  }

  return {
    initData,
    filterDataBy,
    sortDataBy,
    paginateBy,
    selectSeason,
    clearOneFilter,
    data: readonly(data),
    dataConstants: readonly(dataConstants),
    noDataFlag: readonly(noDataFlag),
    errorMessage,
    currentRange: readonly(currentRange),
    numberOfTotalEntries: readonly(numberOfTotalEntries),
    isLoading: readonly(isLoading),
    filterActive,
    activeFilters,
    DEFAULT_LIMIT,
    LIMIT_OPTIONS,
    limitCache,
  };
}
