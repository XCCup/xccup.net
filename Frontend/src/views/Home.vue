<template>
  <Infobox :seasonStats="seasonStats" />
  <DailyRanking :maxRows="5" :flights="dailyRanking" />
  <OverallResults
    :rankingByClass="rankingByClass"
    :topFlights="topFlights"
    :bestClubs="bestClubs"
    :bestTeams="bestTeams"
  />
  <Sponsors :sponsors="sponsors" />
</template>

<script>
import ApiService from "@/services/ApiService.js";
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
      const { data: initialData } = await ApiService.getInitialData();

      // const reponse = await ApiService.getInitialData();

      return {
        dailyRanking: ref(initialData.todaysFlights),
        topFlights: ref(initialData.bestFlightsOverallCurrentYear),
        rankingByClass: ref(initialData.rankingClasses),
        bestClubs: ref(initialData.bestClubs),
        bestTeams: ref(initialData.bestTeams),
        seasonStats: ref(initialData.seasonStats),
        sponsors: ref(initialData.sponsors),
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
