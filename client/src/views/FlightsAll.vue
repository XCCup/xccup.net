<template>
  <div class="container-fluid mb-3">
    <h3>Streckenmeldungen {{ props.year }}</h3>
    <!-- TODO: Add filter spinner when loading -->
    <div class="row">
      <div class="col-6">
        <FlightsFilterPanel
          :is-loading="isLoading"
          :filter-active="filterActive"
          @clear-filter="clearFilter"
          @show-filter="showFilter"
        />
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
import FlightsFilterPanel from "../components/FlightsFilterPanel.vue";

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

const showFilter = () => {
  filterModal.show();
};
</script>
