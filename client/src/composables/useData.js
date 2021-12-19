import { ref, readonly, computed } from "vue";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 25, 50, 100];

const instances = {};

export default (apiEndpoint, apiExtension) => {
  if (!apiEndpoint) throw "No endpoint defined for useData";

  if (!instances[apiEndpoint])
    instances[apiEndpoint] = createInstance(apiEndpoint, apiExtension);

  return instances[apiEndpoint];
};

function createInstance(apiEndpoint, apiExtension) {
  const data = ref([]);
  const sortOptionsCache = ref(null);
  const filterOptionsCache = ref(null);
  const paramsCache = ref(null);
  const limitCache = ref(DEFAULT_LIMIT);
  const numberOfTotalEntries = ref(0);
  const isLoading = ref(false);
  const currentRange = ref({ start: 0, end: 0 });
  const errorMessage = ref("");

  // Getters
  const filterActive = computed(() =>
    checkIfAnyValueOfObjectIsDefined(filterOptionsCache.value)
  );

  // Mutations
  const clearFilter = () => {
    filterOptionsCache.value = null;
    fetchData();
  };

  const sortDataBy = async (sortOptions) => {
    sortOptionsCache.value = sortOptions;
    fetchData();
  };

  const filterDataBy = (filterOptions) => {
    //Check if any filter value was set
    if (!Object.values(filterOptions).find((v) => !!v)) return;
    filterOptionsCache.value = filterOptions;
    fetchData();
  };

  // Actions
  const fetchData = async ({ params, queries, limit, offset = 0 } = {}) => {
    if (params) paramsCache.value = params;
    if (queries) filterOptionsCache.value = queries;
    if (offset < 0) offset = 0;
    if (limit) limitCache.value = limit;
    try {
      isLoading.value = true;
      const res = await apiEndpoint(
        {
          ...paramsCache.value,
          ...filterOptionsCache.value,
          sortCol: sortOptionsCache.value?.sortCol,
          sortOrder: sortOptionsCache.value?.sortOrder,
          limit: limitCache.value,
          offset,
        },
        apiExtension
      );
      if (res.status != 200) throw res.status.text;

      //Check if data supports pagination (data split in rows and count)
      if (res.data.rows) {
        data.value = res.data.rows;
        numberOfTotalEntries.value = res.data.count;
        calcRanges(offset);
        return;
      }

      data.value = res.data;
      errorMessage.value = "";
    } catch (error) {
      console.error(error);
      errorMessage.value =
        "Beim laden der Daten ist ein Fehler aufgetreten. Bitte lade die Seite erneut.";
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
    clearFilter,
    DEFAULT_LIMIT,
    LIMIT_OPTIONS,
  };
}
