<template>
  <div class="container-lg">
    <div v-if="results?.values">
      <h3>{{ title }} {{ router.params?.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="row">
        <div class="col-6">
          <FilterPanel component-name="ResultsOverall" />
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
import { ref, watchEffect } from "vue";

const router = useRoute();
const title = ref("Gesamtwertung");
const remark = ref("");

setWindowName(title.value);

const { fetchData, data: results } = useData("ResultsOverall");

watchEffect(async () => {
  await fetchData(ApiService.getResultsOverall, {
    params: router.params,
    queries: router.query,
  });
  // Not yet used
  remark.value = results?.value?.constants?.REMARKS;
});
</script>
