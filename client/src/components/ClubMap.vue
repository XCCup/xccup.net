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
import { tileOptions } from "@/config/mapbox";
import { ref, onMounted } from "vue";
import { leafletMarkerRetinaFix } from "@/helper/leafletRetinaMarkerFix";

// Fix for default marker image paths
leafletMarkerRetinaFix();

const map = ref(null);
const logos = ref([]);

const props = defineProps({
  clubs: {
    type: Array,
    required: true,
  },
});

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const createPopupContent = (club) => {
  const lines = [];
  lines.push(`<strong>${club.name}</strong><br>`);
  lines.push(
    `Anzahl Teilnahmen seit 2011: ${club.participantInSeasons.length}`
  );
  lines.push("<br>");
  lines.push(
    `<a href=${club.website} target="_blank" rel="noreferrer noopener">Webseite</a>`
  );

  return lines.join("");
};

const addClubMarker = (clubs) => {
  if (clubs.length === 0) return;

  const markerGroup = new L.featureGroup();

  clubs.forEach((club) => {
    if (!club.mapPosition) return;

    logos.value.push(
      L.marker([club.mapPosition.lat, club.mapPosition.lon], {
        title: club.name,
        riseOnHover: true,
      })
        .bindTooltip(club.name, {
          permanent: true,
          direction: "right",
        })
        .bindPopup(createPopupContent(club))
        .addTo(markerGroup)
    );
  });

  map.value.addLayer(markerGroup);
  map.value.fitBounds(markerGroup.getBounds());
};

onMounted(() => {
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  map.value = L.map("mapContainer", {
    gestureHandling: true,
  }).setView([50.143, 7.146], 8);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  ).addTo(map.value);

  addClubMarker(props.clubs);
});
</script>

<style scoped>
#mapContainer {
  min-height: 75vh;
}
</style>
