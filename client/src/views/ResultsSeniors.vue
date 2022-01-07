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
const title = ref("Seniorenwertung");
const remark = ref("");

setWindowName(title.value);

const { fetchData, data: results } = useData(ApiService.getResultsSeniors);

await fetchData({
  params: router.params,
  queries: router.query,
});
// Remark has an internal reference to results. Therefore the fetchData function has to be run at least once before setting the remark value.
remark.value = `Die Wertung beginnt ab einem Alter von ${results?.value?.constants?.SENIOR_START_AGE} mit einem Bonus von ${results?.value?.constants?.SENIOR_BONUS_PER_AGE}% pro Jahr`;
</script>
