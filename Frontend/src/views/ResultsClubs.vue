<template>
  <div class="container-fluid">
    <h3>Vereinswertung {{ year }}</h3>
  </div>
  <ResultsTableClubs :results="results" />
</template>

<script setup async>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";

const props = defineProps({
  year: {
    type: [String, Number],
    required: true,
  },
});

const results = ref(null);

// Name the window
document.title = `${import.meta.env.VITE_PAGE_TITLE_PREFIX}Vereinswertung`;
try {
  const res = await ApiService.getResults("clubs", { year: props.year });
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
