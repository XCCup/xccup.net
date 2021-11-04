<template>
  <div class="row">
    <div
      class="col-xxl-2 col-md-4 col-6 my-1"
      v-for="(rankingClass, index) in rankingByClass"
      :key="index"
    >
      <ResultsOverviewTable :ranking="rankingClass" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rankingByClass: {
    type: Array,
    required: true,
  },
});
</script>
