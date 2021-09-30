<template>
  <table v-if="bestTeams" class="table table-hover">
    <thead>
      <tr></tr>
    </thead>
    <tbody>
      <tr
        v-for="(team, index) in bestTeams.slice(0, 5)"
        v-bind:item="team"
        v-bind:index="index"
        v-bind:key="team.teamId"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td>{{ team.teamName }}</td>
        <td>{{ team.totalPoints }} P</td>
        <td>{{ team.totalDistance }} km</td>
      </tr>
    </tbody>
  </table>
  <router-link
    :to="{ name: 'Home' }"
    class="btn btn-outline-primary btn-sm my-1"
    >Detailierte Liste anzeigen</router-link
  >
</template>

<script>
export default {
  name: "TeamRanking",
  components: {},
  data() {
    return {};
  },
  props: {
    bestTeams: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss"></style>
