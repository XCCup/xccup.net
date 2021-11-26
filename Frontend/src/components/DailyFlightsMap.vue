<template>
  <div id="mapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import tileOptions from "@/config/mapbox.js";

// Fix for default marker image paths
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";

export default {
  name: "DailyFlightsMap",
  props: {
    tracks: {
      type: Array,
      required: true,
    },
    highlightedFlight: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      map: null,
      trackLines: [],
    };
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

    // Fix for default marker image paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.imagePath = "/";
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });

    // Draw tracklogs
    this.drawTracks(this.tracks);
  },
  methods: {
    popup(id) {
      return `Flug ID: ${id} <br/> <a href="/flug/${id}" target="_blank">Öffne Flug</a>`;
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
      if (tracks.length === 0) return;

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
            .bindPopup(this.popup(track.externalId))
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
