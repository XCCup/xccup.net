<template>
  <div
    id="mapContainer"
    class="mb-3"
    :class="userPrefersDark ? 'darken-map' : ''"
  ></div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { tileOptions, tileOptionsSatellite } from "@/config/mapbox";
import { ref, onMounted } from "vue";

import { leafletMarkerRetinaFix } from "@/helper/leafletRetinaMarkerFix";

// Fix for default marker image paths
leafletMarkerRetinaFix();

const map = ref(null);

const props = defineProps({
  sites: {
    type: Array,
    required: true,
  },
});

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

onMounted(() => {
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  const terrain = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  );

  const satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptionsSatellite
  );

  const baseMaps = {
    Gelände: terrain,
    Satellit: satellite,
  };

  map.value = L.map("mapContainer", {
    gestureHandling: true,
  });

  terrain.addTo(map.value);
  createTakeOffMarkers(props.sites).addTo(map.value);
  createXccupBorder().addTo(map.value);

  L.control.layers(baseMaps).addTo(map.value);
  map.value.setView([50.5, 8.0], 7);
});

const createPopupContent = (site) => {
  const lines = [];
  lines.push(`<strong>${site.name}</strong>`);
  if (site.direction) lines.push(`Startrichtung: ${site.direction}`);
  if (site.club) lines.push(`Club: ${site.club.name}`);
  if (site.locationData?.region)
    lines.push(`Region: ${site.locationData.region}`);
  if (site.heightDifference)
    lines.push(`Höhenunterschied: ${site.heightDifference}`);

  return lines.join("<br>");
};

const createTakeOffMarkers = (sites) => {
  if (sites.length === 0) return;
  const listOfTakeoffs = ref([]);

  sites.forEach((site) => {
    if (!site.point) return;

    listOfTakeoffs.value.push(
      L.marker([site.point.coordinates[1], site.point.coordinates[0]], {
        title: site.name,
        riseOnHover: true,
      })
        .bindTooltip(site.name, {
          direction: "right",
        })
        .bindPopup(createPopupContent(site))
    );
  });

  return L.layerGroup(listOfTakeoffs.value);
};

const createXccupBorder = () => {
  const xccupBoundaryPoints = [
    [51.68, 10.38],
    [51.68, 6.02],
    [48.93, 6.02],
    [48.93, 10.38],
  ];
  return L.polygon(xccupBoundaryPoints, { color: "red" });
};
</script>

<style scoped>
#mapContainer {
  min-height: 75vh;
}
</style>

}
