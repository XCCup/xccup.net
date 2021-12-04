<template>
  <div class="row">
    <div
      v-for="(result, index) in results"
      :key="index"
      class="col-lg-4 col-md-6 col-12 my-1"
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
  results: {
    type: Array,
    required: true,
  },
});
</script>
