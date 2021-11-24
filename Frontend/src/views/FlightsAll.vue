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
import ApiService from "@/services/ApiService.js";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";

const route = useRoute();

const props = defineProps({
  year: {
    type: [String, Number],
    default: "",
  },
});

const flights = ref(null);

let filterModal;

let sortOptions;
let filterOptions;

const filterActive = ref(false);

const computedYear = computed(() => (props.year.length ? props.year : ""));

onMounted(() => {
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});
await retrieveFlights();

setWindowName("Streckenmeldungen");

const onFilter = () => {
  filterModal.show();
};

const handleSortChange = (value) => {
  sortOptions = value;
  retrieveFlights();
};

const handleFilterChange = (filterIds) => {
  filterOptions = filterIds;
  filterModal.hide();
  calcFilterActive();
  retrieveFlights();
};

function calcFilterActive() {
  filterActive.value =
    filterOptions && Object.values(filterOptions).find((v) => !!v);
}

async function retrieveFlights() {
  try {
    const { data: initialData } = await ApiService.getFlights({
      ...route.params,
      sortCol: sortOptions?.sortCol,
      sortOrder: sortOptions?.sortOrder,
      ...filterOptions,
    });
    flights.value = initialData;
  } catch (error) {
    console.log(error);
  }
}
</script>
