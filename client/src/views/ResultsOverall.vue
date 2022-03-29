<template>
  <div class="container-lg">
    <h3 v-once>{{ title }} {{ route.params?.year }}</h3>

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
import { ref } from "vue";

const route = useRoute();
const title = ref("Gesamtwertung");
const remark = ref("");

setWindowName(title.value);

const { initData, data: results, dataConstants, noDataFlag } = useData();

// Prevent to send a request query with an empty year parameter
const params = route.params.year ? route.params : undefined;
// Await is necessary to trigger the suspense feature
await initData(ApiService.getResultsOverall, {
  queryParameters: {
    ...route.query,
    ...params,
    limit: 500, // Overwrites the default limit to display more/all results
  },
});
</script>
