<template>
  <div id="mapContainer" :class="userPrefersDark ? 'darken-map' : ''"></div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { tileOptions } from "@/config/mapbox";
import { watchEffect, onMounted, ref } from "vue";

import { leafletMarkerRetinaFix } from "@/helper/leafletRetinaMarkerFix";

// Fix for default marker image paths
leafletMarkerRetinaFix();

const props = defineProps({
  tracks: {
    type: Array,
    required: true,
  },
  highlightedFlight: {
    type: String,
    default: "",
  },
});
const map = ref(null);
const trackLines = ref([]);

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

onMounted(() => {
  // Setup leaflet
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  map.value = L.map("mapContainer", {
    gestureHandling: true,
  }).setView([50.143, 7.146], 8);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  ).addTo(map.value);

  watchEffect(() => highlightTrack(props.highlightedFlight));

  // Draw tracklogs
  drawTracks(props.tracks);
});

const popup = (id) => {
  // TODO: Beautify this popup
  return `Flug ID: ${id} <br/> <a href="/flug/${id}">Öffne Flug</a>`;
};
const highlightTrack = (flightId) => {
  // Reset color of all tracks to default
  trackLines.value.forEach((e) => e.setStyle({ color: "darkred", weight: 3 }));
  if (!flightId) return; // @mouseleave in parent sends "null"

  // Find highlighted track
  let index = props.tracks.findIndex((e) => e.flightId === flightId);
  if (index < 0 || index == null) return; // (!index) does not work because "0" is falsy

  // Highlight track
  trackLines.value[index].setStyle({ color: "#08556d", weight: 5 });
};

const drawTracks = (tracks) => {
  if (tracks.length === 0) return;

  let trackGroup = new L.featureGroup();
  tracks.forEach((track) => {
    let tmp = [];
    track.turnpoints.forEach((tp) => {
      tmp.push([tp.lat, tp.long]);
    });
    trackLines.value.push(
      L.polyline(tmp, {
        color: "darkred",
      })
        .bindPopup(popup(track.externalId))
        .addTo(trackGroup)
    );
  });
  map.value.addLayer(trackGroup);
  map.value.fitBounds(trackGroup.getBounds());
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
