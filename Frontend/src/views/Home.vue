<template>
  <Infobox />
  <DailyRanking :maxRows="5" :flights="dailyRanking" />
  <OverallResults :rankings="overallRanking" :topFlights="topFlights" />
  <Sponsors />
</template>

<script>
import FlightService from "@/services/FlightService.js";
import { ref } from "vue";

import DailyRanking from "@/components/rankings/DailyRanking.vue";
import Infobox from "@/components/Infobox.vue";
import OverallResults from "@/components/OverallResults.vue";
import Sponsors from "@/components/Sponsors.vue";

export default {
  name: "Home",
  async setup() {
    // To simulate longer loading times
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const { data: initialData } = await FlightService.getInitialData();

      // const reponse = await FlightService.getInitialData();
      // const {tageswertung, geraetewertung} = response.data

      return {
        dailyRanking: ref(initialData.tageswertung),
        topFlights: ref(initialData.tageswertung),
        rankingByGliderType: ref(initialData.geraetewertung),
        overallRanking: ref(initialData.geraetewertung),
      };
    } catch (error) {
      console.log(error);
    }
  },
  components: {
    DailyRanking,
    Infobox,
    OverallResults,
    Sponsors,
  },
};
</script>
