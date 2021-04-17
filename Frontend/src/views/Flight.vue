<template>
  <!-- Subnav -->
  <div class="container-fluid flight-info text-light mb-0 p-1">
    <p class="m-0">
      <router-link to="/"><i class="bi bi-chevron-left mx-2"></i> </router-link>

      Flug von <a href="#">{{ flight.pilot }}</a> am
      <a href="#"><BaseDate :timestamp="flight.date" /></a>
    </p>
  </div>

  <MapV2 :tracklogs="tracklogs" />
  <Barogramm :datasets="baroData" :key="baroDataUpdated" />
  <Airbuddies
    v-if="this.flight.airbuddies"
    :flight="this.flight"
    @updateAirbuddies="updateAirbuddies"
  />
  <Inline-alert text="Hover mit Höhenanzeige fehlt noch." />
  <Inline-alert text="Automatisches zentrieren fehlt noch" />

  <FlightDetails :flight="this.flight" :pilot="this.pilot" />
  <FlightDescription :description="description" />
  <Comments
    :comments="comments"
    @comment-submitted="addComment"
    @comment-deleted="deleteComment"
  />
</template>

<script>
// !!! Note to my future self !!!
// The connection between Airbuddies, Barogramm and Map needs refactoring.
// It's to ineffective and you can do better now.

import { ref } from "vue";
import FlightService from "@/services/FlightService.js";
import MapV2 from "@/components/MapV2";
import Airbuddies from "@/components/Airbuddies";
import Barogramm from "@/components/Barogramm.vue";
import trackColors from "@/assets/js/trackColors";
import InlineAlert from "@/components/InlineAlert";
import FlightDetails from "@/components/FlightDetails";
import Comments from "@/components/Comments";
import FlightDescription from "@/components/FlightDescription";

export default {
  name: "FlightView",
  components: {
    MapV2,
    Airbuddies,
    Barogramm,
    InlineAlert,
    FlightDetails,
    Comments,
    FlightDescription,
  },
  async setup() {
    // To simulate longer loading times
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Is this try/catch smart?
    try {
      // Hardcoded flight for development
      let { data: flight } = await FlightService.getFlight(
        "60699294a7c2069af1246316" /*this.flightId or this.$route.params.flightId*/
      );

      // These will be obsolete if the flight modell contains comments and description
      let { data: comments } = await FlightService.getComments();
      let { data: description } = await FlightService.getDescription();

      return {
        flight: ref(flight),
        comments: ref(comments),
        description: ref(description[0]),
      };
    } catch (error) {
      console.log(error);
    }
  },
  props: {
    flightId: { type: String, required: true },
  },
  data() {
    return {
      buddyTracks: null,
      baroDataUpdated: 0,
      pilot: { club: "Good Club", team: "Die sympathischen Speeditöre" },
    };
  },
  methods: {
    updateAirbuddies(buddyTracks) {
      this.buddyTracks = buddyTracks;
    },
    // addComment(comment) {
    //   this.comments.push({
    //     ...comment,
    //     id: String(Math.floor(Math.random() * 100000)),
    //   });
    // },
    async addComment(comment) {
      try {
        // To simulate longer loading times
        // await new Promise((resolve) => setTimeout(resolve, 2000));
        const res = await FlightService.addComment({
          id: String(Math.floor(Math.random() * 100000)),
          ...comment,
        });
        this.comments = [...this.comments, res.data];
      } catch (error) {
        console.log(error);
      }
    },
    async deleteComment(id) {
      try {
        const res = await FlightService.deleteComment(id);
        const res2 = await FlightService.getComments();
        this.comments = res2.data;
      } catch (error) {
        console.log(error);
      }
    },
  },

  watch: {
    baroData() {
      this.baroDataUpdated++;
    },
  },
  computed: {
    baroData() {
      let allBaroData = [];
      let baroData = [];
      let elevation = [];
      for (var i = 0; i < this.flight.fixes.length; i++) {
        elevation.push({
          x: this.flight.fixes[i].timestamp,
          y: this.flight.fixes[i].elevation,
        });
        baroData.push({
          x: this.flight.fixes[i].timestamp,
          y: this.flight.fixes[i].gpsAltitude,
        });
      }
      let hideGND = false;
      if (this.buddyTracks) {
        this.buddyTracks.forEach((element) => {
          if (element.isActive) {
            hideGND = true;
          }
        });
      }

      allBaroData[0] = {
        label: "GND",
        hidden: hideGND,
        fill: true,
        data: elevation,
        backgroundColor: "SaddleBrown",
        borderColor: "SaddleBrown",
      };
      allBaroData[1] = {
        label: "Pilot 1",
        data: baroData,
        backgroundColor: trackColors[0],
        borderColor: trackColors[0],
      };

      if (this.buddyTracks) {
        this.buddyTracks.forEach((element, index) => {
          let buddyBaro = [];
          if (element.isActive) {
            for (var i = 0; i < element.fixes.length; i++) {
              buddyBaro.push([
                element.fixes[i].timestamp,
                element.fixes[i].gpsAltitude,
              ]);
            }
          }
          allBaroData[index + 2] = {
            label: element.buddyName,
            data: buddyBaro,
            backgroundColor: trackColors[index + 1],
            borderColor: trackColors[index + 1],
          };
        });
      }

      return allBaroData;
    },

    tracklogs() {
      let tracklogs = [];
      let tracklog = [];
      for (var i = 0; i < this.flight.fixes.length; i++) {
        tracklog.push([
          this.flight.fixes[i].latitude,
          this.flight.fixes[i].longitude,
        ]);
      }
      tracklogs.push(tracklog);

      if (this.buddyTracks) {
        this.buddyTracks.forEach((element) => {
          let track = [];
          if (element.isActive) {
            for (var i = 0; i < element.fixes.length; i++) {
              track.push([
                element.fixes[i].latitude,
                element.fixes[i].longitude,
              ]);
            }
          }
          tracklogs.push(track);
        });
      }

      return tracklogs;
    },
  },
};
</script>

<style scoped></style>
