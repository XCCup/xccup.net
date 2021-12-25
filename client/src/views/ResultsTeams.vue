<template>
  <div v-if="results" class="container-lg">
    <h3>Teamwertung {{ route.params.year }}</h3>
    <ResultsTableTeams :results="results" />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";

const route = useRoute();
const results = ref(null);

setWindowName("Teamwertung");

try {
  const res = await ApiService.getResults(route.params.year, "teams");
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
