import { isInteger } from "lodash-es";
import { ref, readonly, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const DEFAULT_LIMIT = 50;
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
  const currentRange = ref({ start: 0, end: 0 });
  const errorMessage = ref(null);
  const noDataFlag = ref(false);
  const dataConstants = ref(null);

  const router = useRouter();
  const route = useRoute();

  // Getters
  const filterActive = computed(() =>
    checkIfAnyValueOfObjectIsDefined(route.query)
  );

  const activeFilters = computed(() => {
    // Don't show these query params as filter badges
    const filterBlackList = ["offset", "limit", "year", "sortOrder"];
    return Object.keys(route.query)
      .filter((k) => route.query[k] != null && !filterBlackList.includes(k))
      .reduce((a, k) => ({ ...a, [k]: route.query[k] }), {});
  });

  // Mutations
  const clearOneFilter = (key) => {
    delete queryCache.value[key];
    routerPushView();
  };

  const sortDataBy = async (sortOptions) => {
    queryCache.value.sortCol = sortOptions.sortCol;
    queryCache.value.sortOrder = sortOptions.sortOrder;
    routerPushView();
  };
  const selectSeason = async (year) => {
    // Reset query if year changes
    queryCache.value = { year };
    routerPushView();
  };

  const filterDataBy = (filterOptions) => {
    queryCache.value = {
      ...queryCache.value,
      ...filterOptions,
    };
    routerPushView();
  };

  const paginateBy = async (limit, offset) => {
    queryCache.value.limit = parseInt(limit);
    queryCache.value.offset = offset > 0 ? parseInt(offset) : 0;
    calcRanges();

    routerPushView();
  };

  // Actions
  const fetchData = async (apiEndpoint, { queries } = {}) => {
    try {
      isLoading.value = true;
      const res = await apiEndpoint({
        ...queries,
      });
      if (res.status != 200) throw res.status.text;

      // TODO: What is the intention here?
      if (!res?.data) return;

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
      if (error?.response?.status === 422) {
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

  function routerPushView() {
    router.push({
      name: viewComponentName,
      query: queryCache.value,
    });
  }

  return {
    fetchData,
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
