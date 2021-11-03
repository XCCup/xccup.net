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

<script>
import ResultsOverviewTable from "@/components/rankings/ResultsOverviewTable";
export default {
  name: "ClassRanking",
  components: {
    ResultsOverviewTable,
  },
  props: {
    rankingByClass: {
      type: Array,
      required: true,
    },
  },
};
</script>
