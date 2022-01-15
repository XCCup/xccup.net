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
  const sortOptionsCache = ref(null);
  const filterOptionsCache = ref(null);
  const paramsCache = ref(null);
  const limitCache = ref(DEFAULT_LIMIT);
  const numberOfTotalEntries = ref(0);
  const isLoading = ref(false);
  const currentRange = ref({ start: 0, end: 0 });
  const errorMessage = ref(null);
  const noDataFlag = ref(false);
  const dataConstants = ref(null);

  const router = useRouter();

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
    routerPushView();
  };

  const clearOneFilter = (key) => {
    // I don't know why, but this "simple" delete key, doesn't remove the key from the URL. The result is correct, but as mentioned the URL will not be updated.
    // delete filterOptionsCache.value[key];
    let query = Object.assign({}, filterOptionsCache.value);
    delete query[key];
    filterOptionsCache.value = query;
    routerPushView();
  };

  const sortDataBy = async (sortOptions) => {
    sortOptionsCache.value = sortOptions;
    routerPushView();
  };
  const selectSeason = async (year) => {
    paramsCache.value = {
      ...paramsCache.value,
      year,
    };
    routerPushView();
  };

  const filterDataBy = (filterOptions) => {
    //Check if any filter value was set
    if (!Object.values(filterOptions).find((v) => !!v)) return;

    filterOptionsCache.value = filterOptions;
    routerPushView();
  };

  const paginateBy = async (limit, offset) => {
    routerPushView(limit, offset);
  };

  // Actions
  const fetchData = async (apiEndpoint, { params, queries } = {}) => {
    try {
      if (params) paramsCache.value = params;
      if (isInteger(queries?.limit)) limitCache.value = parseInt(queries.limit);
      const offset =
        queries?.offset && queries.offset > 0 ? parseInt(queries.offset) : 0;

      // Delete pagination parameters from "normal" query parameters
      if (queries) filterOptionsCache.value = queries;
      if (queries?.limit) delete filterOptionsCache.value.limit;
      if (queries?.offset) delete filterOptionsCache.value.offset;

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

  const calcRanges = (offset) => {
    currentRange.value.start = offset + 1;
    currentRange.value.end =
      currentRange.value.start + limitCache.value - 1 >=
      numberOfTotalEntries.value
        ? numberOfTotalEntries.value
        : currentRange.value.start + limitCache.value - 1;
  };

  function routerPushView(limit, offset) {
    router.push({
      name: viewComponentName,
      query: { ...filterOptionsCache.value, limit, offset },
      params: paramsCache.value,
    });
  }

  return {
    fetchData,
    filterDataBy,
    sortDataBy,
    paginateBy,
    selectSeason,
    data: readonly(data),
    dataConstants: readonly(dataConstants),
    noDataFlag,
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
    limitCache,
  };
}
