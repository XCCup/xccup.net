<template>
  <div class="card" v-if="ranking">
    <div class="card-body">
      <h6 class="card-title">
        <i class="bi bi-trophy" :class="ranking.rankingClass"></i>
        {{ ranking.rankingName }}
      </h6>
      <p class="card-text"></p>
      <table class="table">
        <thead></thead>
        <tbody>
          <tr v-for="(pilot, _, i) in ranking" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ ranking.pilots[i].name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResultsTable",
  props: {
    ranking: Object,
  },
};
</script>
