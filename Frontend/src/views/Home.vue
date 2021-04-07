<template>
  <Infobox />
  <DailyRanking :maxRows="5" />
  <OverallResults />
  <Sponsors />
</template>

<script>
import DailyRanking from "@/components/rankings/DailyRanking.vue";
import Infobox from "@/components/Infobox.vue";
import OverallResults from "@/components/OverallResults.vue";
import Sponsors from "@/components/Sponsors.vue";

export default {
  name: "Home",
  components: {
    DailyRanking,
    Infobox,
    OverallResults,
    Sponsors,
  },
};
</script>
