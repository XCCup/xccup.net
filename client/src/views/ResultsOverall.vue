<template>
  <div class="container-lg">
    <h3>{{ title }} {{ router.params?.year }}</h3>

    <div v-if="results">
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="row">
        <div class="col-6">
          <FilterPanel />
        </div>
      </div>
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
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "../composables/useData";
import { ref, watchEffect } from "vue";

const router = useRoute();
const title = ref("Gesamtwertung");
const remark = ref("");

setWindowName(title.value);

const { fetchData, data: results, dataConstants, noDataFlag } = useData();

watchEffect(async () => {
  await fetchData(ApiService.getResultsOverall, {
    params: router.params,
    queries: router.query,
  });
  // Not yet used
  remark.value = dataConstants.value?.REMARKS;
});
</script>
