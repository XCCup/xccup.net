<template>
  <div><MapV3 :tracklogs="tracklogs" /></div>
</template>

<script>
import MapV3 from "@/components/unused_components/MapV3";
import { ref } from "vue";
import FlightService from "@/services/FlightService.js";
import trackColors from "@/assets/js/trackColors";

export default {
  name: "Sandbox",
  components: {
    MapV3,
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
  props: {},
  data() {
    return {
      buddyTracks: null,
      baroDataUpdated: 0,
      pilot: { club: "Good Club", team: "Die sympathischen Speeditöre" },
    };
  },
  methods: {},
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
