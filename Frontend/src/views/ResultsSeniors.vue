<template>
  <div class="container-fluid">
    <h3>Seniorenwertung {{ year }}</h3>
  </div>
  <ResultsTable :results="results" :maxFlights="3" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import ResultsTable from "@/components/rankings/ResultsTable";

import { ref } from "vue";

export default {
  name: "ResultsSeniors",
  components: { ResultsTable },
  props: {
    year: {
      type: [String, Number],
    },
  },
  // Todo: This is reused very often. Maybe make it shared code
  async setup(props) {
    const results = ref(null);
    try {
      const res = await ApiService.getSeniorResults({
        year: props.year,
      });
      if (res.status != 200) throw res.status.text;
      results.value = res.data;
    } catch (error) {
      results.value = [];
      console.log(error);
    }
    return { results };
  },
};
</script>
