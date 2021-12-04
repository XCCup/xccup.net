<template>
  <table v-if="bestTeams" id="teamRankingTable" class="table table-hover">
    <tbody>
      <tr
        v-for="(team, index) in bestTeams.slice(0, 5)"
        :key="team.teamId"
        :item="team"
        :index="index"
      >
        <th scope="row">{{ index + 1 }}</th>
        <!-- TODO: Add link to team -->
        <td>{{ team.teamName }}</td>
        <td class="no-line-break">{{ team.totalPoints }} P</td>
        <td class="no-line-break">{{ Math.floor(team.totalDistance) }} km</td>
      </tr>
    </tbody>
  </table>
  <router-link
    :to="{ name: 'ResultsTeams', params: { year: new Date().getFullYear() } }"
    class="btn btn-outline-primary btn-sm my-1"
  >
    Detailierte Liste anzeigen
  </router-link>
</template>

<script setup>
defineProps({
  bestTeams: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped lang="scss"></style>
