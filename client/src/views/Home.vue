<template>
  <div v-if="seasonStats">
    <InfoBox :season-stats="seasonStats" />
    <DailyResults
      :max-rows="10"
      :flights="dailyResults"
      :liveFlights="liveFlights"
    />
    <NewsPanel v-if="newsItems?.length > 0" :news-items="newsItems" />
    <PhotoCarousel :photos="randomPhotos" />

    <ResultsOverview
      :results-by-class="resultsByClass"
      :top-flights="topFlights"
      :best-clubs="bestClubs"
      :best-teams="bestTeams"
    />
    <SponsorsPanel :sponsors="sponsors" />
  </div>
  <GenericError v-else />
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRouter } from "vue-router";
const router = useRouter();

const dailyResults = ref(null);
const liveFlights = ref(null);
const topFlights = ref(null);
const resultsByClass = ref(null);
const bestClubs = ref(null);
const newsItems = ref(null);
const bestTeams = ref(null);
const seasonStats = ref(null);
const sponsors = ref(null);
const randomPhotos = ref(null);

setWindowName("Home");

try {
  const { data: initialData } = await ApiService.getInitialData();

  dailyResults.value = initialData.todaysFlights;
  liveFlights.value = initialData.liveFlights;
  topFlights.value = initialData.bestFlightsOverallCurrentYear;
  resultsByClass.value = initialData.rankingClasses;
  bestClubs.value = initialData.bestClubs;
  bestTeams.value = initialData.bestTeams;
  seasonStats.value = initialData.seasonStats;
  sponsors.value = initialData.sponsors;
  randomPhotos.value = initialData.randomPhotos;
  newsItems.value = initialData.activeNews;
} catch (error) {
  console.log(error);
  router.push({
    name: "NetworkError",
  });
}
</script>
