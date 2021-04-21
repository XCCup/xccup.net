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
  async setup(props) {
    // To simulate longer loading times
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Is this try/catch smart?
    try {
      // Hardcoded flight for development
      let demoFlightId = "60699294a7c2069af1246316";

      if (props.flightId === "607fc418d24f48f5fa426a73") {
        demoFlightId = "607fc418d24f48f5fa426a73";
      }
      let { data: flight } = await FlightService.getFlight(
        demoFlightId
        /*this.flightId or this.$route.params.flightId*/
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
    flightId: { type: String },
    oldFlightId: { type: String },
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
    async addComment(comment) {
      try {
        const res = await FlightService.addComment({
          id: String(Math.floor(Math.random() * 100000)),
          ...comment,
        });
        // Only as long as the API doesnt exist
        this.comments = [...this.comments, res.data];
      } catch (error) {
        console.log(error);
      }
    },
    async deleteComment(id) {
      try {
        await FlightService.deleteComment(id);
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
      return processBaroData(this.flight, this.buddyTracks);
    },

    tracklogs() {
      return processTracklogs(this.flight, this.buddyTracks);
    },
  },
};

// Process tracklog data for map
function processTracklogs(flight, buddyTracks) {
  const tracklogs = [];
  const tracklog = [];
  for (var i = 0; i < flight.fixes.length; i++) {
    tracklog.push([flight.fixes[i].latitude, flight.fixes[i].longitude]);
  }
  tracklogs.push(tracklog);

  if (buddyTracks) {
    buddyTracks.forEach((element) => {
      const track = [];
      // Check if this track is activated
      if (element.isActive) {
        for (var i = 0; i < element.fixes.length; i++) {
          track.push([element.fixes[i].latitude, element.fixes[i].longitude]);
        }
      }
      tracklogs.push(track);
    });
  }
  return tracklogs;
}

// Process tracklog data for barogramm
function processBaroData(flight, buddyTracks) {
  const allBaroData = [];
  const baroData = [];
  const elevation = [];
  for (var i = 0; i < flight.fixes.length; i++) {
    elevation.push({
      x: flight.fixes[i].timestamp,
      y: flight.fixes[i].elevation,
    });
    baroData.push({
      x: flight.fixes[i].timestamp,
      y: flight.fixes[i].gpsAltitude,
    });
  }
  let hideGND = false;
  // Check if any buddy track is activated. If so: Hide the GND dataset
  // Maybe this can be done smarter
  if (buddyTracks) {
    buddyTracks.forEach((element) => {
      if (element.isActive) {
        hideGND = true;
      }
    });
  }
  // Dataset for elevation graph (GND)
  allBaroData[0] = {
    label: "GND",
    hidden: hideGND,
    fill: true,
    data: elevation,
    backgroundColor: "SaddleBrown",
    borderColor: "SaddleBrown",
  };
  // Dataset for main flight
  allBaroData[1] = {
    label: "Pilot 1",
    data: baroData,
    backgroundColor: trackColors[0],
    borderColor: trackColors[0],
  };
  // Datasets for all aribuddies
  if (buddyTracks) {
    buddyTracks.forEach((element, index) => {
      const buddyBaro = [];
      // Check if this track is activated
      if (element.isActive) {
        for (var i = 0; i < element.fixes.length; i++) {
          buddyBaro.push([
            element.fixes[i].timestamp,
            element.fixes[i].gpsAltitude,
          ]);
        }
      }
      // Create the buddy dataset
      allBaroData[index + 2] = {
        label: element.buddyName,
        data: buddyBaro,
        backgroundColor: trackColors[index + 1],
        borderColor: trackColors[index + 1],
      };
    });
  }
  return allBaroData;
}
</script>
