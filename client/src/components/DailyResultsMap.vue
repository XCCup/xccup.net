<template>
  <div id="mapContainer" class="darken-map"></div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple } from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { tileOptions } from "@/config/mapbox";
import { watchEffect, onMounted, ref } from "vue";

const props = defineProps<{
  tracks: FlightTrack[];
  highlightedFlight?: string;
}>();

let map: L.Map;
const trackLines = ref<L.Polyline[]>([]);

type FlightTrack = {
  flightId: number;
  turnpoints: {
    lat: number;
    long: number;
  }[];
};

onMounted(() => {
  // Setup leaflet
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  map = L.map("mapContainer", {
    // @ts-expect-error
    gestureHandling: true,
    zoomAnimation: false,
  }).setView([50.143, 7.146], 8);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  ).addTo(map);

  watchEffect(() => highlightTrack(props.highlightedFlight));

  // Draw tracklogs
  drawTracks(props.tracks);
});

const highlightTrack = (flightId?: string) => {
  // Reset color of all tracks to default
  trackLines.value.forEach((e) =>
    e.setStyle({ color: "darkred", weight: 2.5 })
  );
  if (!flightId) return; // @mouseleave in parent sends "null"

  // Find highlighted track
  let index = props.tracks.findIndex((e) => e.flightId.toString() === flightId);
  if (index < 0 || index == null) return; // (!index) does not work because "0" is falsy

  // Highlight track
  trackLines.value[index].setStyle({ color: "#08556d", weight: 4 });
};

const drawTracks = (tracks: FlightTrack[]) => {
  if (tracks.length === 0) return;
  const trackGroup = L.featureGroup();
  tracks.forEach((track) => {
    const fixes = track.turnpoints.map(
      (tp) => [tp.lat, tp.long] as LatLngTuple
    );
    trackLines.value.push(
      L.polyline(fixes, {
        color: "darkred",
      }).addTo(trackGroup)
    );
  });
  map.addLayer(trackGroup);
  map.fitBounds(trackGroup.getBounds());
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
