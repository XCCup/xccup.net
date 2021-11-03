<template>
  <div class="container-fluid">
    <h3>Damenwertung {{ year }}</h3>
  </div>
  <ResultsTable :results="results" :maxFlights="3" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import ResultsTable from "@/components/rankings/ResultsTable";

import { ref } from "vue";

export default {
  name: "ResultsLadies",
  components: { ResultsTable },
  props: {
    year: {
      type: [String, Number],
    },
  },

  async setup(props) {
    const results = ref(null);
    try {
      const res = await ApiService.getLadiesResults({
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
