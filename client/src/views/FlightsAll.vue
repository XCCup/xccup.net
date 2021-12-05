<template>
  <div class="container-fluid mb-3">
    <h3>Streckenmeldungen {{ props.year }}</h3>
    <!-- TODO: Add filter spinner when loading -->
    <div class="row">
      <div class="col-6">
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
          @click="clearFilter"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="col-6"><PaginationPanel /></div>
    </div>
  </div>
  <ResultsTableOverall />
  <ModalFilterFlights />
</template>

<script setup>
import { onMounted } from "vue";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useFlights from "@/composables/useFlights";
import { useRoute } from "vue-router";

setWindowName("Streckenmeldungen");

const props = defineProps({
  year: {
    type: [String, Number],
    default: "",
  },
});
const route = useRoute();

const { fetchFlights, filterActive, clearFilter, isLoading } = useFlights();
await fetchFlights({ params: route.params, queries: route.query });

let filterModal;
onMounted(() => {
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});

const onFilter = () => {
  filterModal.show();
};
</script>
