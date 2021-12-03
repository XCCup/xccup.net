<template>
  <div id="classRankingPanel" class="row">
    <div
      v-for="(result, index) in resultsByClass"
      :key="index"
      class="col-xxl-2 col-md-4 col-12 my-1"
    >
      <div class="card-body">
        <h6 class="card-title">
          <RankingClass :ranking-class="{ key: result.name }" />
          {{ result.shortReadableName }}
        </h6>
        <p class="card-text"></p>
        <table class="table">
          <tbody>
            <tr v-for="n in 3" :key="n">
              <td>{{ n }}</td>
              <!-- TODO: Add link to pilot -->
              <td v-if="result.values[n]">
                {{
                  result.values[n]?.user.firstName +
                  " " +
                  result.values[n]?.user.lastName
                }}
              </td>
              <td v-else>-</td>
              <td v-if="result.values[n]">
                <span class="fw-lighter no-line-break"
                  >{{ result.values[n]?.totalPoints }} P</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  resultsByClass: {
    type: Array,
    required: true,
  },
});
</script>
