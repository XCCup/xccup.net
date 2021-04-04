<template>
  <MapV2 :tracklogs="tracklogs" />
</template>

<script>
import { ref } from "vue";
import FlightService from "@/services/FlightService.js";
import MapV2 from "@/components/MapV2";

export default {
  components: {
    MapV2,
  },
  async setup() {
    let { data: flight } = await FlightService.getFlight(
      "60699294a7c2069af1246316" /*this.$route.params.flightId*/
    );
    return {
      flight: ref(flight),
    };
  },
  computed: {
    tracklogs() {
      let baroData = [];
      let elevation = [];
      let tracklog = [];
      for (var i = 0; i < this.flight.fixes.length; i++) {
        elevation.push({
          x: this.flight.fixes[i].timestamp,
          y: this.flight.fixes[i].elevation,
        });
        baroData.push({
          x: this.flight.fixes[i].timestamp,
          y: this.flight.fixes[i].gpsAltitude,
        });
        tracklog.push([
          this.flight.fixes[i].latitude,
          this.flight.fixes[i].longitude,
        ]);
      }
      return [tracklog];
    },
  },
};
</script>

<style scoped></style>
