<template>
  <div id="mapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import tileOptions from "@/config/mapbox";

export default {
  name: "DailyFlightsMap",
  data() {
    return {
      map: null,
      trackLines: [],
    };
  },
  props: {
    tracks: {
      type: Array,
      default: () => {
        return [];
      },
    },
    highlightedFlight: {
      type: String,
    },
  },
  watch: {
    highlightedFlight() {
      this.highlightTrack(this.highlightedFlight);
    },
  },
  mounted() {
    // Setup leaflet
    L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

    this.map = L.map("mapContainer", {
      gestureHandling: true,
    }).setView([50.143, 7.146], 8);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
      tileOptions
    ).addTo(this.map);

    // Wepback fix for default marker image paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.imagePath = "/";
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    // Draw tracklogs
    this.drawTracks(this.tracks);
  },
  methods: {
    popup(flightId) {
      return `Flight ID: ${flightId} <br/> <a href>Link</a>`;
    },
    highlightTrack(flightId) {
      // Reset color of all tracks to default
      this.trackLines.forEach((e) =>
        e.setStyle({ color: "darkred", weight: 3 })
      );
      if (!flightId) return; // @mouseleave in parent sends "null"

      // Find highlighted track
      let index = this.tracks.findIndex((e) => e.flightId === flightId);
      if (index < 0 || index == null) return; // (!index) does not work because "0" is falsy

      // Highlight track
      this.trackLines[index].setStyle({ color: "#08556d", weight: 5 });
    },
    drawTracks(tracks) {
      let trackGroup = new L.featureGroup();
      tracks.forEach((track) => {
        let tmp = [];
        track.turnpoints.forEach((tp) => {
          tmp.push([tp.lat, tp.long]);
        });
        this.trackLines.push(
          L.polyline(tmp, {
            color: "darkred",
          })
            .bindPopup(this.popup(track.flightId))
            .addTo(trackGroup)
        );
      });
      this.map.addLayer(trackGroup);
      this.map.fitBounds(trackGroup.getBounds());
    },
  },
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
