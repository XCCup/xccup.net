<template>
  <div id="mapContainer"></div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import tileOptions from "@/config/mapbox.js";
import { ref, onMounted } from "vue";
import { getbaseURL } from "@/helper/baseUrlHelper";

const map = ref(null);
const logos = ref([]);

const props = defineProps({
  clubs: {
    type: Array,
    required: true,
  },
});

const createPopupContent = (club) => {
  const baseURL = getbaseURL();
  const lines = [];
  lines.push(`<strong>${club.name}</strong>`);
  lines.push(
    `Anzahl Teilnahmen seit 2011: ${club.participantInSeasons.length}`
  );
  // It was also considered to add the total number of participants. But due to concerns that some clubs will stay absent when there are only a few participants, this idea is for now postponed.
  // lines.push(`Mitglieder im XCCup: 42`);
  lines.push(
    `<a href=${club.website} target="_blank" rel="noreferrer noopener">${club.website}</a>`
  );
  lines.push(
    `<a href=${club.website} target="_blank" rel="noreferrer noopener"><img src="${baseURL}clubs/logo/${club.logo.id}?thumb=true" height="50" max-width="150"></a>`
  );

  return lines.join("<br>");
};

const addClubLogos = (clubs) => {
  if (clubs.length === 0) return;

  const logoGroup = new L.featureGroup();

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
        .addTo(logoGroup)
    );
  });

  map.value.addLayer(logoGroup);
  map.value.fitBounds(logoGroup.getBounds());
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

  addClubLogos(props.clubs);
});
</script>

<style scoped>
#mapContainer {
  min-height: 75vh;
}
</style>
