<template>
  <div class="container-lg">
    <div v-if="results">
      <h3>Teamwertung {{ route.params.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <ResultsTableTeams :results="results" />
    </div>
    <GenericError v-else />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";

const route = useRoute();
const results = ref(null);
const remark = ref(null);

setWindowName("Teamwertung");

try {
  const res = await ApiService.getResultsTeams({ ...route.params });
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
  remark.value = results?.value?.constants?.REMARKS;
} catch (error) {
  console.log(error);
}
</script>
