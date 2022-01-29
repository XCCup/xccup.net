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
import { tileOptions, tileOptionsSatellite } from "@/config/mapbox.js";
import { ref, onMounted } from "vue";

const map = ref(null);
const logos = ref([]);

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

const createPopupContent = (site) => {
  const lines = [];
  lines.push(`<strong>${site.name}</strong>`);
  if (site.direction) lines.push(`Startrichtung: ${site.direction}`);
  if (site.club) lines.push(`Club: ${site.club.name}`);
  if (site.region) lines.push(`Region: ${site.region}`);
  if (site.heightDifference)
    lines.push(`Höhenunterschied: ${site.heightDifference}`);

  return lines.join("<br>");
};

const addSiteMarker = (sites) => {
  if (sites.length === 0) return;

  const markerGroup = new L.featureGroup();

  sites.forEach((site) => {
    if (!site.point) return;

    logos.value.push(
      L.marker([site.point.coordinates[1], site.point.coordinates[0]], {
        title: site.name,
        riseOnHover: true,
      })
        .bindTooltip(site.name, {
          direction: "right",
        })
        .bindPopup(createPopupContent(site))
        .addTo(markerGroup)
    );
  });

  map.value.addLayer(markerGroup);
  map.value.fitBounds(markerGroup.getBounds());
};

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
  L.control.layers(baseMaps).addTo(map.value);
  map.value.setView([50.143, 7.146], 8);

  addSiteMarker(props.sites);
});
</script>

<style scoped>
#mapContainer {
  min-height: 75vh;
}
</style>
