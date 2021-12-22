<template>
  <div class="container-lg mb-3">
    <h3>Streckenmeldungen {{ route.params.year }}</h3>
    <!-- TODO: Add filter spinner when loading -->

    <div class="row">
      <div class="col-6">
        <FilterPanel
          :api-endpoint="ApiService.getFlights"
          :flight-options="true"
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
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import useData from "@/composables/useData";
import { useRoute } from "vue-router";

setWindowName("Streckenmeldungen");

const route = useRoute();

const { fetchData, errorMessage } = useData(ApiService.getFlights);

fetchData({ params: route.params.year, queries: route.query });
</script>
