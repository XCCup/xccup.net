<template>
  <div class="container-lg">
    <div v-if="results">
      <h3>{{ title }} {{ router.params?.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="my-2"><SelectSeason /></div>

      <ResultsTableGeneric
        :results="results"
        :no-data-flag="noDataFlag"
        :max-flights="dataConstants?.NUMBER_OF_SCORED_FLIGHTS ?? 0"
      />
    </div>
    <GenericError v-else />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "../composables/useData";

const router = useRoute();
const title = ref("Damenwertung");

setWindowName(title.value);

const {
  fetchData,
  data: results,
  dataConstants,
  noDataFlag,
} = useData("ResultsLadies");

await fetchData(ApiService.getResultsLadies, {
  params: router.params,
  queries: router.query,
});
// Not yet used
const remark = ref(dataConstants.value?.REMARKS);
</script>
