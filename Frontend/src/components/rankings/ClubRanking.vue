<template>
  <table v-if="bestClubs" class="table table-hover">
    <thead>
      <tr></tr>
    </thead>
    <tbody>
      <tr
        v-for="(club, index) in bestClubs.slice(0, 5)"
        v-bind:item="club"
        v-bind:index="index"
        v-bind:key="club.clubId"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td>{{ club.clubName }}</td>
        <td>{{ club.totalPoints }} P</td>
        <td>{{ Math.floor(club.totalDistance) }} km</td>
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
  name: "ClubRanking",
  props: {
    bestClubs: {
      type: Array,
      required: true,
    },
  },
};
</script>
