<template>
  <div class="container-fluid">
    <h3>Teamwertung {{ year }}</h3>
  </div>
  <ResultsTableTeams :results="results" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import ResultsTableTeams from "@/components/rankings/ResultsTableTeams";

import { ref } from "vue";

export default {
  name: "ResultsTeams",
  components: { ResultsTableTeams },
  props: {
    year: {
      type: [String, Number],
      required: true,
    },
  },
  async setup(props) {
    const results = ref(null);

    try {
      const res = await ApiService.getResults("teams", { year: props.year });
      if (res.status != 200) throw res.status.text;
      results.value = res.data;
    } catch (error) {
      console.log(error);
    }

    return { results };
  },
};
</script>
