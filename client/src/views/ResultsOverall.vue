<template>
  <div class="container-lg">
    <div v-if="results?.values">
      <h3>{{ title }} {{ router.params?.year }}</h3>
      <div class="row">
        <div class="col-6">
          <FilterPanel :api-endpoint="ApiService.getResultsOverall" />
        </div>
      </div>
      <ResultsTableGeneric
        :results="results?.values"
        :max-flights="results?.constants?.NUMBER_OF_SCORED_FLIGHTS"
      />
    </div>
    <GenericError v-else />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "../composables/useData";
import { ref } from "vue";

const router = useRoute();
const title = ref("Gesamtwertung");

setWindowName(title.value);

const { fetchData, data: results } = useData(ApiService.getResultsOverall);

await fetchData({
  params: router.params,
  queries: router.query,
});
</script>
