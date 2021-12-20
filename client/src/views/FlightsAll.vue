<template>
  <div class="container-lg mb-3">
    <h3>Streckenmeldungen {{ route.params.year }}</h3>
    <!-- TODO: Add filter spinner when loading -->

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
    <BaseError :error-message="errorMessage" />
    <ResultsTableOverall />
    <ModalFilterFlights />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { onMounted, ref } from "vue";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useData from "@/composables/useData";
import { useRoute } from "vue-router";

setWindowName("Streckenmeldungen");

const route = useRoute();

const { fetchData, errorMessage } = useData(ApiService.getFlights);

fetchData({ params: route.params.year, queries: route.query });

let filterModal;
onMounted(() => {
  // TODO: This is not very clean as it is not clear where the id comes from.
  // Better use ref instead of document selector
  filterModal = new Modal(document.getElementById("flightFilterModal"));
});

const showFilter = () => {
  filterModal.show();
};
</script>
