<template>
  <div id="classRankingPanel" class="row">
    <div
      v-for="(rankingClass, index) in rankingByClass"
      :key="index"
      class="col-xxl-2 col-lg-4 col-md-6 col-12 my-1"
    >
      <ResultsOverviewTable :ranking="rankingClass" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  rankingByClass: {
    type: Array,
    required: true,
  },
});
</script>
