<template>
  <div class="container-fluid mb-3">
    <h3>Streckenmeldungen {{ computedYear }}</h3>
    <button
      type="button"
      class="btn btn-outline-primary btn-sm m-1 col-4 col-sm-2 col-lg-1"
      @click="onFilter"
    >
      Filter <i v-if="filterActive" class="bi bi-funnel"></i>
    </button>
  </div>
  <FlightsTable :flights="flights" @table-sort-changed="handleSortChange" />
  <ModalFilterFlights @filter-changed="handleFilterChange" />
</template>

<script setup>
import { computed, onMounted } from "vue";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useFlights from "@/composables/useFlights";

const { flights, updateFlights, filterActive } = useFlights();

const props = defineProps({
  year: {
    type: [String, Number],
    default: "",
  },
});

let filterModal;

const computedYear = computed(() => (props.year.length ? props.year : ""));

onMounted(() => {
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});

setWindowName("Streckenmeldungen");

const onFilter = () => {
  filterModal.show();
};

const handleSortChange = (value) => {
  updateFlights({ sortOptions: value });
};

const handleFilterChange = (filterIds) => {
  updateFlights({ filterOptions: filterIds });
  filterModal.hide();
};
</script>
