<template>
  <span class="d-none d-dark-inline container"
    >Dark mode ist noch nicht schön, funktioniert aber…
  </span>

  <InfoBox :season-stats="seasonStats" />
  <DailyResults :max-rows="5" :flights="dailyResults" />
  <OverallResults
    :results-by-class="resultsByClass"
    :top-flights="topFlights"
    :best-clubs="bestClubs"
    :best-teams="bestTeams"
  />
  <PhotoCarousel />
  <SponsorsPanel :sponsors="sponsors" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRouter } from "vue-router";
const router = useRouter();

const dailyResults = ref(null);
const topFlights = ref(null);
const resultsByClass = ref(null);
const bestClubs = ref(null);
const bestTeams = ref(null);
const seasonStats = ref(null);
const sponsors = ref(null);

setWindowName("Home");

try {
  // To simulate longer loading times
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const { data: initialData } = await ApiService.getInitialData();

  dailyResults.value = initialData.todaysFlights;
  topFlights.value = initialData.bestFlightsOverallCurrentYear;
  resultsByClass.value = initialData.rankingClasses;
  bestClubs.value = initialData.bestClubs;
  bestTeams.value = initialData.bestTeams;
  seasonStats.value = initialData.seasonStats;
  sponsors.value = initialData.sponsors;
} catch (error) {
  console.log(error);
  router.push({
    name: "NetworkError",
  });
}
</script>
