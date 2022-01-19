import { ref, readonly, computed, watch, watchEffect } from "vue";
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
  let apiEndpoint = null;

  const router = useRouter();

  const filterBlackList = ["offset", "limit", "year", "sortOrder", "sortCol"];

  // Getters
  const filterActive = computed(() => {
    // console.log("QC Before: ", Object.keys(queryCache.value));
    // return checkIfAnyValueOfObjectIsDefined(queryCache.value);

    return activeFilters.value.length > 0;

    // const entries = Object.entries(queryCache.value).filter(
    //   ([k, v]) => v != undefined && !filterBlackList.includes(k)
    // );

    // console.log("entries: ", entries);
    // return queryCache.value.length;

    // const filteredQueryObject = Object.fromEntries(
    // );

    // console.log("FQO: ", filteredQueryObject);

    // const newLocal = Object.keys(filteredQueryObject).length > 0;
    // console.log("Fil Act: ", newLocal);
    // return newLocal;
    // // return {checkIfAnyValueOfObjectIsDefined(filteredParameters)}
  });

  const activeFilters = ref([]);

  watch(
    () => queryCache.value,
    () => {
      const newLocal = Object.keys(queryCache.value)
        .filter(
          (k) => queryCache.value[k] != null && !filterBlackList.includes(k)
        )
        .reduce((a, k) => ({ ...a, [k]: queryCache.value[k] }), {});
      // Don't show these query params as filter badges

      console.log("ACT FIL: ", newLocal.value);

      activeFilters.value = newLocal;
    },
    { deep: true }
  );

  // const activeFilters = computed(() => {
  //   console.log("ACT FIL ENT");
  //   const newLocal = Object.keys(queryCache.value)
  //     .filter(
  //       (k) => queryCache.value[k] != null && !filterBlackList.includes(k)
  //     )
  //     .reduce((a, k) => ({ ...a, [k]: queryCache.value[k] }), {});
  //   // Don't show these query params as filter badges

  //   console.log("ACT FIL: ", activeFilters);
  //   return newLocal;
  // });

  // Mutations
  const clearOneFilter = (key) => {
    delete queryCache.value[key];
    fetchData();
  };

  const sortDataBy = async (sortOptions) => {
    console.log("SDB");
    queryCache.value.sortCol = sortOptions.sortCol;
    queryCache.value.sortOrder = sortOptions.sortOrder;
    fetchData();
  };
  const selectSeason = async (year) => {
    console.log("SS");
    // // Reset query if year changes
    // queryCache.value = { year };
    router.push({
      name: viewComponentName,
      params: { year },
    });
    // fetchData();
  };

  const filterDataBy = (filterOptions) => {
    console.log("FDB");
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
    apiEndpoint = apiEndpointFunction;
    await fetchData();
  };

  // Actions
  const fetchData = async () => {
    try {
      isLoading.value = true;
      const res = await apiEndpoint(queryCache.value);

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

  return {
    initData,
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
