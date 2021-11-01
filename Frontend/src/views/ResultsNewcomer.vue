<template>Newcomer Ranking</template>

<script>
import ApiService from "@/services/ApiService.js";
// import FlightsTable from "@/components/rankings/FlightsTable";

import { ref } from "vue";

export default {
  name: "ResultsNewcomer",
  components: {},

  async setup() {
    try {
      const { data: initialData } = await ApiService.getNewcomerRanking();
      return {
        flights: ref(initialData),
      };
    } catch (error) {
      console.log(error);
    }
  },
};
</script>
