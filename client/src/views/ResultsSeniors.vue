<template>
  <div class="container-lg">
    <h3>{{ title }} {{ route.params?.year }}</h3>

    <div v-if="results">
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
const title = ref("Seniorenwertung");

setWindowName(title.value);

const { fetchData, data: results, dataConstants, noDataFlag } = useData();

await fetchData(ApiService.getResultsSeniors, {
  params: route.params,
  queries: route.query,
});

const remark = ref(dataConstants.value?.REMARKS);
</script>
