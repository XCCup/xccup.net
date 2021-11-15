<template>
  <div class="container-fluid">
    <h3>Teamwertung {{ year }}</h3>
  </div>
  <ResultsTableTeams :results="results" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";

const props = defineProps({
  year: {
    type: [String, Number],
    required: true,
  },
});

const results = ref(null);

setWindowName("Teamwertung");

try {
  const res = await ApiService.getResults("teams", { year: props.year });
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
