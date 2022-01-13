<template>
  <div class="container-lg">
    <h3>{{ title }} {{ router.params?.year }}</h3>

    <div v-if="results">
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="row">
        <div class="col-6">
          <FilterPanel :api-endpoint="ApiService.getResultsOverall" />
        </div>
      </div>
      <ResultsTableGeneric
        :results="results?.values"
        :no-data-flag="noDataFlag"
        :max-flights="results?.constants?.NUMBER_OF_SCORED_FLIGHTS ?? 0"
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

const {
  fetchData,
  data: results,
  noDataFlag,
} = useData(ApiService.getResultsOverall);

await fetchData({
  params: router.params,
  queries: router.query,
});
// Not yet used
const remark = ref(results?.value?.constants?.REMARKS);
</script>
