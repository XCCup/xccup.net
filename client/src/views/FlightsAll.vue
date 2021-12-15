<template>
  <div class="container-lg mb-3">
    <h3>Streckenmeldungen {{ props.year }}</h3>
    <div class="row">
      <div class="col-6">
        <FilterPanel
          :api-endpoint="ApiService.getFlights"
          @show-filter="showFilter"
        />
      </div>
      <div class="col-6">
        <PaginationPanel
          :api-endpoint="ApiService.getFlights"
          entry-name="Flüge"
        />
      </div>
    </div>
    <ResultsTableOverall />
    <ModalFilterFlights />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { onMounted } from "vue";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useData from "@/composables/useData";
import { useRoute } from "vue-router";

setWindowName("Streckenmeldungen");

const props = defineProps({
  year: {
    type: [String, Number],
    default: "",
  },
});
const route = useRoute();

const { fetchData } = useData(ApiService.getFlights);

fetchData({ params: route.params, queries: route.query });

let filterModal;
onMounted(() => {
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});

const showFilter = () => {
  filterModal.show();
};
</script>
