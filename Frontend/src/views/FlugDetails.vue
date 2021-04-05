<template>
  <div>
    <div v-if="loaded" class="container-fluid flight-info text-light mb-0 p-1">
      <p class="m-0">
        <router-link to="/"
          ><i class="bi bi-chevron-left mx-2"></i>
        </router-link>

        Flug von <a href="#">{{ flight.pilot }}</a> am
        <a href="#">{{ format(new Date(flight.date), "dd.MM.yyyy") }}</a>
      </p>
    </div>

    <Map :tracklogs="tracklogs" />
    <div class="d-flex justify-content-center" v-if="baroData.length === 0">
      <div class="spinner-border text-primary m-5" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <Barogramm
      :datasets="baroData"
      :key="baroDataUpdated"
      v-if="baroData.length != 0"
    />
    <Airbuddies
      v-if="this.flight.airbuddies"
      :airbuddies="this.flight.airbuddies"
    />
    <Inline-alert
      text="Hover mit Höhenanzeige fehlt
      noch."
    />
    <Inline-alert text="Automatisches zentrieren optional?" />
    <Inline-alert text="Airbuddies funktionieren noch nicht" />
    <Inline-alert text="Button glow?" />

    <FlugEigenschaften
      :flight="this.flight"
      :pilot="this.pilot"
      v-if="this.loaded"
    />
    <FlightDescription :description="description" />
    <Comments :comments="comments" @comment-submitted="addComment" />
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
import trackColors from "@/assets/js/trackColors";
import InlineAlert from "@/components/InlineAlert";
import { format } from "date-fns";

export default {
  name: "FlugDetails",
  components: {
    FlugEigenschaften,
    Barogramm,
    Map,
    Airbuddies,
    FlightDescription,
    Comments,
    InlineAlert,
  },
  data() {
    return {
      format,
      baroData: [],
      baroDataUpdated: 0,
      flight: {},
      tracklogs: [],
      pilot: { club: "Good Club", team: "Die sympathischen Speeditöre" },
      comments: [],
      description: {},
      loaded: false,
    };
  },
  methods: {
    addComment(comment) {
      this.comments.push(comment);
    },
  },
  created() {
    // Hard coded for development
    FlightService.getFlight(
      "60699294a7c2069af1246316" /*this.$route.params.flightId*/
    )
      .then((response) => {
        let flight = response.data;
        let baroData = [];
        let elevation = [];
        let tracklog = [];
        for (var i = 0; i < response.data.fixes.length; i++) {
          elevation.push({
            x: flight.fixes[i].timestamp,
            y: flight.fixes[i].elevation,
          });
          baroData.push({
            x: flight.fixes[i].timestamp,
            y: flight.fixes[i].gpsAltitude,
          });
          tracklog.push([flight.fixes[i].latitude, flight.fixes[i].longitude]);
        }
        this.baroData[0] = {
          label: "GND",
          fill: true,
          data: elevation,
          backgroundColor: "SaddleBrown",
          borderColor: "SaddleBrown",
        };
        this.baroData[1] = {
          label: "Pilot 1",
          data: baroData,
          backgroundColor: trackColors[0],
          borderColor: trackColors[0],
        };
        this.tracklogs = [tracklog];
        this.flight = response.data;
        // This is a workaround to trigger the re-render of the chart
        this.baroDataUpdated++;

        // Testing second flight (hardcoded)
        // FlightService.getFlight("605922ae657fe94af9071e63")
        //   .then((response) => {
        //     let flight = response.data;
        //     let baroData = [];
        //     let tracklog = [];
        //     for (var i = 0; i < response.data.fixes.length; i++) {
        //       baroData.push({
        //         x: flight.fixes[i].timestamp,
        //         y: flight.fixes[i].gpsAltitude,
        //       });
        //       tracklog.push([
        //         flight.fixes[i].latitude,
        //         flight.fixes[i].longitude,
        //       ]);
        //     }
        //     this.baroData[1] = {
        //       label: "Pilot 2",
        //       data: baroData,
        //       backgroundColor: trackColors[1],
        //       borderColor: trackColors[1],
        //     };
        //     this.tracklogs = [...this.tracklogs, tracklog];
        //     // This is a workaround to trigger the re-render of the chart
        //     this.baroDataUpdated++;
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      })
      .then(() => {
        this.loaded = true;
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
<style scoped></style>
