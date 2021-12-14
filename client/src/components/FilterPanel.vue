<template>
  <button
    id="filterButton"
    type="button"
    class="col btn btn-outline-primary btn-sm me-1 mb-3"
    @click="onFilter"
  >
    Filter
    <BaseSpinner v-if="isLoading" />
    <i v-else class="bi bi-funnel"></i>
  </button>
  <button
    v-if="filterActive"
    id="filterRemoveButton"
    type="button"
    class="col btn btn-outline-danger btn-sm me-1 mb-3"
    @click="clearFilter"
  >
    <i class="bi bi-x"></i>
  </button>
</template>

<script setup>
import useData from "../composables/useData";

const props = defineProps({
  apiEndpoint: {
    type: Function,
    required: true,
  },
});

const { clearFilter, filterActive, isLoading } = useData(props.apiEndpoint);

const emit = defineEmits(["show-filter"]);

const onFilter = () => emit("show-filter");
</script>
