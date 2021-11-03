<template>
  <div class="container-fluid">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
  </div>
  <ResultsTable :results="results" :maxFlights="3" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import ResultsTable from "@/components/rankings/ResultsTable";

import { ref } from "vue";

export default {
  name: "ResultsTeams",
  components: { ResultsTable },
  props: {
    year: {
      type: [String, Number],
      required: true,
    },
  },
  async setup(props) {
    const results = ref(null);

    try {
      const res = await ApiService.getResultsTeams({ year: props.year });
      if (res.status != 200) throw res.status.text;
      results.value = res.data;
    } catch (error) {
      console.log(error);
    }

    return { results };
  },
};
</script>
