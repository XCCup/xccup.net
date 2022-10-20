import { ref } from "vue";
import ApiService from "@/services/ApiService";
import type { FilterOptions } from "@/types/FilterOptions";

const filterOptions = ref<FilterOptions | null>(null);

export default () => {
  const getFilterOptions = async () => {
    if (filterOptions.value) return filterOptions;

    await fetch();
    return filterOptions;
  };

  return { get: getFilterOptions };
};

async function fetch() {
  filterOptions.value = (await ApiService.getFilterOptions()).data;
}
