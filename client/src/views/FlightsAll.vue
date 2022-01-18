<template>
  <div class="container-xl mb-3">
    <h3>Streckenmeldungen {{ route.params.year }}</h3>

    <!-- TODO: Add filter spinner when loading -->

    <div class="row">
      <div class="col-6">
        <FilterPanel :flight-options="true" />
      </div>
      <div class="col-6">
        <PaginationPanel entry-name="Flüge" />
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
import { watch } from "vue";

setWindowName("Streckenmeldungen");

const route = useRoute();

const { fetchData, errorMessage } = useData();

// Await is necessary to trigger the suspense feature
await fetchData(ApiService.getFlights, {
  queries: route.query,
});

// Refetch data if a query param changes
watch(
  () => route.query,
  () => {
    fetchData(ApiService.getFlights, {
      queries: route.query,
    });
  }
);
</script>
