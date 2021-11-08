<template>
  <div v-if="flight">
    <TheSubnav :flight="flight" />
    <FlightMap
      v-if="false"
      :tracklogs="tracklogs"
      :turnpoints="flight.flightTurnpoints"
      :airspaces="airspaces"
    />
    <FlightBarogramm :datasets="baroData" :key="baroDataUpdated" />
    <Airbuddies
      v-if="flight.airbuddies.length > 0"
      :flight="flight"
      @updateAirbuddies="updateAirbuddies"
    />
    <FlightDetails :flight="flight" />
    <FlightReport :report="flight.report" :photos="flight.photos" />
    <Comments
      ref="Comments"
      :comments="flight.comments"
      @submitComment="addComment"
      @deleteComment="deleteComment"
      @deleteReply="deleteComment"
      @commentEdited="editComment"
    />
  </div>
</template>

<script>
// TODO: Note to my future self:
// The connection between Airbuddies, FlightBarogramm and Map needs refactoring.
// It's to ineffective and you can do better now.

import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import ApiService from "@/services/ApiService.js";
import trackColors from "@/assets/js/trackColors.js";

export default {
  name: "FlightView",
  async setup() {
    const router = useRouter();
    const route = useRoute();
    const flight = ref(null);
    const airspaces = ref(null);

    const fetchData = async () => {
      try {
        // To simulate longer loading times
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await ApiService.getFlight(route.params.flightId);
        if (!response.data.fixes) {
          throw "Invalid response";
        }
        flight.value = response.data;
        // Name the window
        document.title = `XCCup - Flug von ${
          flight.value.user.firstName + " " + flight.value.user.lastName
        }`;
        const res = await ApiService.getAirspaces();
        airspaces.value = res.data;
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status == 404) {
          router.push({
            name: "404Resource",
            params: { resource: "Dieser Flug existiert nicht." },
          });
        } else {
          router.push({ name: "NetworkError" });
        }
      }
    };

    fetchData();

    return { flight, airspaces };
  },
  data() {
    return {
      buddyTracks: null,
      baroDataUpdated: 0,
    };
  },
  methods: {
    updateAirbuddies(buddyTracks) {
      this.buddyTracks = buddyTracks;
    },
    async addComment(comment) {
      try {
        const res = await ApiService.addComment({
          flightId: this.flight.id,
          ...comment,
        });

        // TODO: Maybe use an optimistic aproach like:
        // this.flight.comments = [...this.flight.comments, comment];
        if (res.status != 200) throw res.statusText;
        this.$refs.Comments.clearCommentEditorInput();
        if (comment.relatedTo)
          this.$refs.Comments.$refs[`${comment.relatedTo}`].closeReplyEditor();

        this.updateComments();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteComment(id) {
      try {
        const res = await ApiService.deleteComment(id);
        if (res.status != 200) throw res.statusText;
        this.updateComments();
      } catch (error) {
        console.log(error);
      }
    },
    async editComment(comment) {
      try {
        const res = await ApiService.editComment(comment);
        if (res.status != 200) throw res.statusText;
        await this.updateComments();
        // Check if the edited comment is a reply to a parent comment
        // and close the comment editor via $ref. Needed because the $refs are nested.
        if (
          this.$refs.Comments.$refs[`${comment.relatedTo}`]?.$refs[
            `${comment.id}`
          ]
        ) {
          this.$refs.Comments.$refs[`${comment.relatedTo}`].$refs[
            `${comment.id}`
          ].closeCommentEditor();
        } else {
          // Else
          this.$refs.Comments.$refs[`${comment.id}`].closeCommentEditor();
        }
      } catch (error) {
        console.log(error);
      }
    },
    async updateComments() {
      const res = await ApiService.getCommentsOfFlight(this.flight.id);

      if (res.status != 200) throw res.statusText;
      this.flight.comments = [...res.data];
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
  if (!flight) return null;
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
