<template>
  <div class="container-lg">
    <div v-if="results">
      <h3>{{ title }} {{ router.params?.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="my-2"><SelectSeason /></div>

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
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "../composables/useData";

const router = useRoute();
const title = ref("Landesmeisterschaft RLP");

setWindowName(title.value);

const {
  fetchData,
  data: results,
  noDataFlag,
} = useData(ApiService.getResultsRlp);

await fetchData({
  params: router.params,
  queries: router.query,
});
const remark = ref(results?.value?.constants?.REMARKS_STATE);
</script>
