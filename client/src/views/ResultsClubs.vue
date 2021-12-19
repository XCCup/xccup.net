<template>
  <div class="container-lg">
    <h3>Vereinswertung {{ route.params.year }}</h3>
    <ResultsTableClubs :results="results" />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";

const route = useRoute();

const results = ref(null);

setWindowName("Vereinswertung");

try {
  const res = await ApiService.getResults(route.params.year, "clubs");
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
