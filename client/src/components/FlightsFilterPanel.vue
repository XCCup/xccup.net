<template>
  <button
    id="flightsFilterButton"
    type="button"
    class="col btn btn-outline-primary btn-sm me-1"
    @click="onFilter"
  >
    Filter
    <BaseSpinner v-if="isLoading" />
    <i v-else class="bi bi-funnel"></i>
  </button>
  <button
    v-if="filterActive"
    id="flightsFilterRemoveButton"
    type="button"
    class="col btn btn-outline-danger btn-sm me-1"
    @click="onClear"
  >
    <i class="bi bi-x"></i>
  </button>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  filterActive: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["show-filter", "clear-filter"]);

const onFilter = () => emit("show-filter");
const onClear = () => emit("clear-filter");
</script>
