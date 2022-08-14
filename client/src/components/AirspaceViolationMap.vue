<template>
  <div
    id="mapContainer"
    :class="userPrefersDark ? 'darken-map' : ''"
    class="mb-3"
  ></div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { tileOptions } from "@/config/mapbox";
import { onMounted, ref } from "vue";
// Fix for default marker image paths
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";
import { drawAirspaces, drawViolations } from "../helper/mapHelpers";
import type { AirspaceViolation } from "@/types/Airspace";

const props = defineProps({
  airspaceViolation: {
    type: Object,
    required: true,
  },
});

let map: L.Map;
// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

onMounted(() => {
  // Setup leaflet
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  // Centerpoint for map
  const centerViolation: AirspaceViolation =
    props.airspaceViolation.airspaceViolations[
      Math.floor(props.airspaceViolation.airspaceViolations.length / 2)
    ];

  map = L.map("mapContainer", {
    // @ts-expect-error
    gestureHandling: true,
  }).setView([centerViolation.lat, centerViolation.long], 10);
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  ).addTo(map);

  // Fix for default marker image paths
  // @ts-expect-error
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.imagePath = "/";
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
  drawViolations(map, props.airspaceViolation.airspaceViolations);
  drawTrack(props.airspaceViolation.flightTrackLine);
  drawAirspacesAroundCenter(centerViolation);
});

const drawAirspacesAroundCenter = async (
  centerViolation: AirspaceViolation
) => {
  const bounds =
    Number.parseFloat(centerViolation.long.toString()) -
    0.01 +
    "," +
    (Number.parseFloat(centerViolation.lat.toString()) + 0.01).toFixed(3) +
    "|" +
    (Number.parseFloat(centerViolation.long.toString()) + 0.01).toFixed(3) +
    "," +
    (Number.parseFloat(centerViolation.lat.toString()) + 0.01).toFixed(3) +
    "|" +
    (Number.parseFloat(centerViolation.long.toString()) + 0.01).toFixed(3) +
    "," +
    (Number.parseFloat(centerViolation.lat.toString()) - 0.01).toFixed(3) +
    "|" +
    (Number.parseFloat(centerViolation.long.toString()) - 0.01).toFixed(3) +
    "," +
    (Number.parseFloat(centerViolation.lat.toString()) - 0.01).toFixed(3);
  drawAirspaces(map, bounds);
};

interface TrackPoint {
  latitude: number;
  longitude: number;
}

const drawTrack = (track: TrackPoint[]) => {
  if (!track.length) return;
  let linePoints: L.LatLngExpression[] = [];
  track.forEach((point) => {
    linePoints.push([point.latitude, point.longitude]);
  });
  const line = L.polyline(linePoints, {
    color: "green",
  });
  map.addLayer(line);
  map.fitBounds(line.getBounds());
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
