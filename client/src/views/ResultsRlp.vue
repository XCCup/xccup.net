<template>
  <div v-once class="container-lg">
    <div v-if="results">
      <h3>{{ title }} {{ route.params?.year }}</h3>
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

const route = useRoute();
const title = ref("Rheinland-Pfalz Pokal");

setWindowName(title.value);

const { initData, data: results, dataConstants, noDataFlag } = useData();

// Prevent to send a request query with an empty year parameter
const params = route.params.year ? route.params : undefined;
// Await is necessary to trigger the suspense feature
await initData(ApiService.getResultsRlp, {
  queryParameters: {
    ...route.query,
    ...params,
  },
});
const remark = ref(dataConstants.value?.REMARKS_STATE);
</script>
