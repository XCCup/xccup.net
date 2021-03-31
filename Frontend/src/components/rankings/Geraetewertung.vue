<template>
  <div class="row">
    <div
      class="col-xxl-2 col-md-4 col-6 my-1"
      v-for="(table, index) in this.geraetewertung"
      :key="index"
    >
      <Wertungstabelle :wertung="table" />
    </div>
  </div>
</template>

<script>
import Wertungstabelle from "@/components/rankings/Wertungstabelle";
import FlightService from "@/services/FlightService";
export default {
  name: "Geraetewertung",
  components: {
    Wertungstabelle,
  },
  data() {
    return {
      geraetewertung: {},
    };
  },
  created() {
    FlightService.getGeraetewertung()
      .then((response) => {
        this.geraetewertung = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style scoped lang="scss"></style>
