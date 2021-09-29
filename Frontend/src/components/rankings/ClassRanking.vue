<template>
  <div class="row">
    <div
      class="col-xxl-2 col-md-4 col-6 my-1"
      v-for="(rankingClass, index) in rankingByClass"
      :key="index"
    >
      <ResultsTable :ranking="rankingClass" />
    </div>
  </div>
</template>

<script>
import ResultsTable from "@/components/rankings/ResultsTable";
export default {
  name: "ClassRanking",
  components: {
    ResultsTable,
  },
  props: {
    rankingByClass: {
      type: Array,
      required: true,
    },
  },
};
</script>
