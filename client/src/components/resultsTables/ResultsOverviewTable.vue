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
          <tr v-for="n in maxRows" :key="n">
            <td>{{ n }}</td>
            <!-- TODO: Add link to pilot -->
            <td v-if="ranking.values[n]">
              {{
                ranking.values[n]?.user.firstName +
                " " +
                ranking.values[n]?.user.lastName
              }}
            </td>
            <td v-else>-</td>
            <td v-if="ranking.values[n]">
              <span class="fw-lighter no-line-break"
                >{{ ranking.values[n]?.totalPoints }} P</span
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
  maxRows: { type: [Number, String], default: 3 },
});
</script>
