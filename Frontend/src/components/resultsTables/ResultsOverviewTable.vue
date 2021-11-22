<template>
  <div v-if="ranking" class="card">
    <div class="card-body">
      <h6 class="card-title">
        <RankingClass :ranking-class="{ key: ranking.name }" />
        {{ ranking.shortReadableName }}
      </h6>
      <p class="card-text"></p>
      <table class="table">
        <tbody>
          <tr v-for="(pilot, index) in ranking.values.slice(0, 3)" :key="index">
            <td>{{ index + 1 }}</td>
            <!-- Todo: Add link to pilot -->
            <td>{{ pilot.user.firstName + " " + pilot.user.lastName }}</td>
            <td>
              <span class="fw-lighter no-line-break"
                >{{ pilot.totalPoints }} P</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ranking: { type: Object, required: true },
});
</script>
