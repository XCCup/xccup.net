<template>
  <div class="row">
    <div
      class="col-xxl-2 col-md-4 col-6 my-1"
      v-for="(table, index) in this.classRanking"
      :key="index"
    >
      <ResultsTable :ranking="table" />
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
    classRanking: {
      type: Array,
      required: true,
    },
  },
};
</script>
