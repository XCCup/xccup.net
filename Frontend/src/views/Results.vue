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
  name: "Results",
  components: { ResultsTable },
  props: {
    year: {
      type: [String, Number],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  async setup(props) {
    const categories = [
      {
        name: "overall",
        title: "Gesamtwertung",
        apiString: "",
      },
      {
        name: "newcomer",
        title: "Newcomerwertung",
        apiString: "newcomer",
      },
      {
        name: "seniors",
        title: "Seniorenwertung",
        apiString: "seniors",
      },
      {
        name: "ladies",
        title: "Damenwertung",
        apiString: "?gender=W",
      },
    ];
    const activeCategory = categories.find((e) => e.name === props.category);
    const results = ref(null);

    try {
      if (!activeCategory) throw "not a valid category";
      const res = await ApiService.getResults(activeCategory.apiString, {
        year: props.year,
      });
      if (res.status != 200) throw res.status.text;
      results.value = res.data;
    } catch (error) {
      // results.value = [];
      console.log(error);
    }

    return { results, activeCategory };
  },
};
</script>
