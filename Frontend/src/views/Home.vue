<template>
  <div>
    {{ state.counter }}
  </div>
  <div>
    <!-- Increment using a method defined in the composable -->
    <button @click.prevent="increment()">+ Increment</button>

    <!-- Decrement by mutating the state directly -->
    <button @click.prevent="state.counter--">- Decrement</button>
  </div>
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

<script setup async>
import ApiService from "@/services/ApiService.js";

import useCounter from "@/composables/global";
const { state, increment } = useCounter();

import { ref, inject } from "vue";

const dailyRanking = ref(null);
const topFlights = ref(null);
const rankingByClass = ref(null);
const bestClubs = ref(null);
const bestTeams = ref(null);
const seasonStats = ref(null);
const sponsors = ref(null);
try {
  // To simulate longer loading times
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const { data: initialData } = await ApiService.getInitialData();

  dailyRanking.value = initialData.todaysFlights;
  topFlights.value = initialData.bestFlightsOverallCurrentYear;
  rankingByClass.value = initialData.rankingClasses;
  bestClubs.value = initialData.bestClubs;
  bestTeams.value = initialData.bestTeams;
  seasonStats.value = initialData.seasonStats;
  sponsors.value = initialData.sponsors;
} catch (error) {
  console.log(error);
}
</script>
