<template>
  <div class="card" v-if="ranking">
    <div class="card-body">
      <h6 class="card-title">
        <i class="bi bi-trophy" :class="ranking.name"></i>
        {{ ranking.name }}
      </h6>
      <p class="card-text"></p>
      <table class="table">
        <thead></thead>
        <tbody>
          <tr v-for="(pilot, index) in ranking.values.slice(0, 3)" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ pilot.userName }}</td>
            <td>
              <p class="fw-lighter">{{ pilot.totalPoints }} P.</p>
            </td>
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
