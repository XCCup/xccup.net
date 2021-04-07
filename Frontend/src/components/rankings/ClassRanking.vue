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
import FlightService from "@/services/FlightService";
export default {
  name: "ClassRanking",
  components: {
    ResultsTable,
  },
  data() {
    return {
      classRanking: {},
    };
  },
  created() {
    FlightService.getClassRanking()
      .then((response) => {
        this.classRanking = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style scoped lang="scss"></style>
