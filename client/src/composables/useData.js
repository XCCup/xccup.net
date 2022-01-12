import { isInteger } from "lodash-es";
import { ref, readonly, computed } from "vue";
import { useRouter } from "vue-router";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 25, 50, 100];

const instances = {};

export default (viewComponentName) => {
  if (!viewComponentName) throw "No view defined for useData";

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
    //TODO: The cache and the data will be updated correctly, but the URL still shows the filter. WHY AND HOW???
    delete filterOptionsCache.value[key];
    routerPushView();
  };

  const sortDataBy = async (sortOptions) => {
    sortOptionsCache.value = sortOptions;
    routerPushView();
  };

  const filterDataBy = (filterOptions) => {
    //Check if any filter value was set
    if (!Object.values(filterOptions).find((v) => !!v)) return;

    filterOptionsCache.value = filterOptions;
    routerPushView();
  };

  const paginatBy = async (limit, offset) => {
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
      if (queries?.limit) delete queries.limit;
      if (queries?.offset) delete queries.offset;
      if (queries) filterOptionsCache.value = queries;

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
      if (!res?.data) return;
      //Check if data supports pagination (data split in rows and count)
      if (res.data.rows) {
        data.value = res.data.rows;
        numberOfTotalEntries.value = res.data.count;
        calcRanges(offset);
      } else {
        data.value = res?.data;
      }
    } catch (error) {
      console.error(error);
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
      query: {
        ...filterOptionsCache.value,
        limit,
        offset,
      },
      params: {
        ...paramsCache.value,
      },
    });
  }

  return {
    fetchData,
    filterDataBy,
    sortDataBy,
    paginatBy,
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
    limitCache,
  };
}
