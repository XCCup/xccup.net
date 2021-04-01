<template>
  <div>
    <div class="container-fluid flight-info text-light mb-0 p-1">
      <p class="m-0">
        <a href="#"><i class="bi bi-chevron-left mx-2"></i></a>Flug von
        <a href="#">{{ flight.pilot }}</a> am <a href="#">{{ flight.date }}</a>
      </p>
    </div>

    <Map :tracklogs="tracklogs" />
    <Barogramm :datasets="baroData" :key="baroDataUpdated" />
    <Airbuddies
      v-if="this.flight.airbuddies"
      :airbuddies="this.flight.airbuddies"
    />
    <div class="container mt-2">
      <i class="bi bi-exclamation-triangle"></i> Hover mit Höhenanzeige fehlt
      noch.<i class="bi bi-exclamation-triangle"></i>
      <br />
      <i class="bi bi-exclamation-triangle"></i>
      Automatisches zentrieren optional?<i
        class="bi bi-exclamation-triangle"
      ></i>
      <br />
    </div>

    <FlugEigenschaften :flight="this.flight" :pilot="this.pilot" />
    <FlightDescription :description="description" />
    <Comments :comments="comments" />
  </div>
</template>

<script>
import FlightService from "@/services/FlightService.js";
import FlugEigenschaften from "@/components/FlugEigenschaften";
import Barogramm from "@/components/Barogramm.vue";
import Airbuddies from "@/components/Airbuddies.vue";
import Map from "@/components/Map";
import Comments from "@/components/Comments";
import FlightDescription from "@/components/FlightDescription";
export default {
  name: "FlugDetails",
  components: {
    FlugEigenschaften,
    Barogramm,
    Map,
    Airbuddies,
    FlightDescription,
    Comments,
  },
  data() {
    return {
      baroData: [
        {
          label: "Stephan",
          data: [],
          backgroundColor: "rgb(139, 0, 0)",
          borderColor: "rgb(139, 0, 0)",
        },
      ],
      baroDataUpdated: 0,
      flight: {},
      tracklogs: [[]],
      pilot: { club: "Good Club" },
      comments: [],
      description: {},
    };
  },
  created() {
    FlightService.getFlight(this.$route.params.flightId)
      .then((response) => {
        let flight = response.data;
        let baroData = [];
        let tracklog = [];
        for (var i = 0; i < response.data.fixes.length; i++) {
          baroData.push({
            x: flight.fixes[i].timestamp,
            y: flight.fixes[i].gpsAltitude,
          });
          tracklog.push([flight.fixes[i].latitude, flight.fixes[i].longitude]);
        }
        this.baroData[0].data = baroData;
        this.tracklogs = [tracklog];
        this.flight = response.data;
        // This is a workaround to trigger the re-render of the chart
        this.baroDataUpdated++;
      })
      .catch((error) => {
        console.log(error);
      });
    FlightService.getComments().then((response) => {
      this.comments = response.data;
    });
    FlightService.getDescription().then((response) => {
      this.description = response.data[0];
    });
  },
};
</script>
