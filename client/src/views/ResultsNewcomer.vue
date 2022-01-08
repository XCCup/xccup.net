<template>
  <div class="container-lg">
    <div v-if="results?.values">
      <h3>{{ title }} {{ router.params?.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
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
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "../composables/useData";

const router = useRoute();
const title = ref("Newcomerwertung");

setWindowName(title.value);

const { fetchData, data: results } = useData(ApiService.getResultsNewcomer);

await fetchData({
  params: router.params,
  queries: router.query,
});
const remark = ref(results?.value?.constants?.REMARKS);
</script>
