<template>
  <table v-if="bestClubs" id="clubRankingTable" class="table table-hover">
    <tbody>
      <tr
        v-for="(club, index) in bestClubs.slice(0, 5)"
        :key="club.clubId"
        :item="club"
        :index="index"
      >
        <th scope="row">{{ index + 1 }}</th>
        <!-- TODO: Add link to club -->
        <td>{{ club.clubName }}</td>
        <td class="no-line-break">{{ club.totalPoints }} P</td>
        <td class="no-line-break">{{ Math.floor(club.totalDistance) }} km</td>
      </tr>
    </tbody>
  </table>
  <router-link
    :to="{ name: 'ResultsClubs', params: { year: new Date().getFullYear() } }"
    class="btn btn-outline-primary btn-sm my-1"
    >Detailierte Liste anzeigen</router-link
  >
</template>

<script setup>
defineProps({
  bestClubs: {
    type: Array,
    required: true,
  },
});
</script>
