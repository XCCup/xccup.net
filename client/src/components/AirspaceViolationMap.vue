<template>
  <div
    id="mapContainer"
    :class="userPrefersDark ? 'darken-map' : ''"
    class="mb-3"
  ></div>
</template>

<script setup>
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
import ApiService from "../services/ApiService";
import { createAirspacePopupContent } from "../helper/mapHelpers";

const props = defineProps({
  airspaceViolation: {
    type: Object,
    required: true,
  },
});
const map = ref(null);

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

onMounted(() => {
  // Setup leaflet
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  map.value = L.map("mapContainer", {
    gestureHandling: true,
  }).setView([props.airspaceViolation.lat, props.airspaceViolation.long], 10);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  ).addTo(map.value);

  // Fix for default marker image paths
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.imagePath = "/";
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });

  drawViolation(props.airspaceViolation);
  drawTrack(props.airspaceViolation.line);
  drawAirspaces(props.airspaceViolation);
});

const drawAirspaces = async (airspaceViolation) => {
  try {
    const res = await ApiService.getAirspaces(
      Number.parseFloat(airspaceViolation.long) -
        0.01 +
        "," +
        (Number.parseFloat(airspaceViolation.lat) + 0.01) +
        "|" +
        (Number.parseFloat(airspaceViolation.long) + 0.01) +
        "," +
        (Number.parseFloat(airspaceViolation.lat) + 0.01) +
        "|" +
        (Number.parseFloat(airspaceViolation.long) + 0.01) +
        "," +
        (Number.parseFloat(airspaceViolation.lat) - 0.01) +
        "|" +
        (Number.parseFloat(airspaceViolation.long) - 0.01) +
        "," +
        (Number.parseFloat(airspaceViolation.lat) - 0.01)
    );
    const airspaceData = res.data;
    const options = {
      opacity: 0.1,
      fillOpacity: 0.08,
      color: "red",
    };
    airspaceData.forEach((airspace) => {
      L.geoJSON(airspace.polygon, options)
        .bindPopup(createAirspacePopupContent(airspace))
        .addTo(map.value);
    });
  } catch (error) {
    console.log(error);
  }
};

const drawTrack = (track) => {
  let linePoints = [];
  track.forEach((point) => {
    linePoints.push([point.latitude, point.longitude]);
  });
  const line = L.polyline(linePoints, {
    color: "darkred",
  });
  map.value.addLayer(line);
  map.value.fitBounds(line.getBounds());
};

const drawViolation = (violation) => {
  const violationMarker = L.marker([violation.lat, violation.long], {
    color: "darkred",
  }).bindPopup(createPopupContent(violation));
  map.value.addLayer(violationMarker);
};

const createPopupContent = (violation) => {
  return "Höhe: " + violation.altitude + "m MSL";
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
