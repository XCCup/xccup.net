<template>
  <div>
    <button @click="updateChart">Update Chart</button>

    <canvas id="barogramm"></canvas>
  </div>
</template>

<script>
// import "chartjs-adapter-date-fns";
import FlightService from "@/services/FlightService";

export default {
  name: "Sandbox",
  props: {},
  mounted() {},

  created() {
    FlightService.getFlight("605e2181b2b5a2de2e0c6f63")
      .then((response) => {
        let flight = response.data;
        let track1 = [];
        // let latLongData1 = [];
        for (var i = 0; i < response.data.fixes.length; i++) {
          track1.push({
            x: flight.fixes[i].timestamp,
            y: flight.fixes[i].gpsAltitude,
          });
          // latLongData1.push([
          //   flight.fixes[i].latitude,
          //   flight.fixes[i].longitude,
          // ]);
        }
        this.trackData = track1;
        // const ctx = document.getElementById("planet-chart");
        // this.barogramm = new Chart(ctx, this.planetChartData);
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style scoped>
#barogramm {
  height: 100px;
}
</style>
