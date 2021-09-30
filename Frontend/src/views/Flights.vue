<template>
  <AllFlights :flights="flights" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import AllFlights from "@/components/rankings/AllFlights";

import { ref } from "vue";

export default {
  name: "Flights",
  async setup() {
    // To simulate longer loading times
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const { data: initialData } = await ApiService.getFlights();

      // const reponse = await ApiService.getInitialData();
      // const {tageswertung, geraetewertung} = response.data

      return {
        flights: ref(initialData),
      };
    } catch (error) {
      console.log(error);
    }
  },
  components: { AllFlights },
};
</script>
