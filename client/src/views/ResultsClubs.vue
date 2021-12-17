<template>
  <div class="container-lg">
    <h3>Vereinswertung {{ year }}</h3>
    <ResultsTableClubs :results="results" />
  </div>
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

setWindowName("Vereinswertung");

try {
  const res = await ApiService.getResults({ year: props.year }, "clubs");
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
