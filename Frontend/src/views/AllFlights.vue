<template>
  <FlightsTable :flights="flights" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import FlightsTable from "@/components/rankings/FlightsTable";

import { ref } from "vue";

export default {
  name: "AllFlights",
  components: { FlightsTable },

  async setup() {
    // To simulate longer loading times
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const { data: initialData } = await ApiService.getFlights();
      return {
        flights: ref(initialData),
      };
    } catch (error) {
      console.log(error);
    }
  },
};
</script>
