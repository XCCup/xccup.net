<template>
  <div id="mapContainer" class="mb-3 darken-map"></div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { tileOptions } from "@/config/mapbox";
import { onMounted } from "vue";

import {
  drawAirspaces,
  drawAirspaceViolationMarkers,
} from "../helper/mapHelpers";
import type { AirspaceViolation } from "@/types/Airspace";

const props = defineProps({
  airspaceViolation: {
    type: Object,
    required: true,
  },
});

let map: L.Map;

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

  // TODO: This hurts my eyes. Lets find a better naming scheme for this.
  drawAirspaceViolationMarkers(map, props.airspaceViolation.airspaceViolations);
  drawTrack(props.airspaceViolation.flightTrackLine);
  drawAirspacesAroundCenter(centerViolation);
});

const drawAirspacesAroundCenter = async (
  centerViolation: AirspaceViolation
) => {
  const formatPoint = (point: number, offset: number) =>
    (point + offset).toFixed(3);

  const bounds =
    formatPoint(centerViolation.long, -0.01) +
    "," +
    formatPoint(centerViolation.lat, 0.01) +
    "|" +
    formatPoint(centerViolation.long, 0.01) +
    "," +
    formatPoint(centerViolation.lat, 0.01) +
    "|" +
    formatPoint(centerViolation.long, 0.01) +
    "," +
    formatPoint(centerViolation.lat, -0.01) +
    "|" +
    formatPoint(centerViolation.long, -0.01) +
    "," +
    formatPoint(centerViolation.lat, -0.01);
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
