<template>
  <div class="container-fluid mb-3">
    <h3>Streckenmeldungen {{ props.year }}</h3>
    <!-- TODO: Add filter spinner when loading -->
    <button
      type="button"
      class="btn btn-outline-primary btn-sm me-1"
      @click="onFilter"
    >
      Filter <i class="bi bi-funnel"></i>
    </button>
    <button
      v-if="filterActive"
      type="button"
      class="btn btn-outline-danger btn-sm"
      @click="clearFilter"
    >
      <i class="bi bi-x"></i>
    </button>
  </div>
  <FlightsTable />
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

const { fetchFlights, filterActive, clearFilter } = useFlights();
await fetchFlights(route.params, route.query);

let filterModal;

onMounted(() => {
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});

const onFilter = () => {
  filterModal.show();
};
</script>
