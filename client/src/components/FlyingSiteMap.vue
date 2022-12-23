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
import { ADDITIONAL_COLORS } from "@/common/Constants";

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
  lines.push(`<a href="/fluege?siteId=${site.id}">Flüge suchen</a>`);

  return lines.join("<br>");
};

const createRegionIcon = (site) => {
  const region = site.locationData?.region;
  let color = ADDITIONAL_COLORS[0];
  switch (region) {
    case "Mosel":
      color = ADDITIONAL_COLORS[1];
      break;
    case "Luxemburg":
      color = ADDITIONAL_COLORS[2];
      break;
    case "Pfalz":
      color = ADDITIONAL_COLORS[3];
      break;
    case "Nahe":
      color = ADDITIONAL_COLORS[4];
      break;
    case "Rhön":
      color = ADDITIONAL_COLORS[5];
      break;
    case "Sauerland":
      color = ADDITIONAL_COLORS[6];
      break;
    default:
      break;
  }

  return L.divIcon({
    className: "flyingsite-map-marker",
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill=${color} class="bi bi-flag-fill" viewBox="0 0 16 16">
      <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001"/>
    </svg>
    `,
  });
};

const createTakeOffMarkers = (sites) => {
  if (sites.length === 0) return;
  const listOfTakeoffs = ref([]);

  sites.forEach((site) => {
    if (!site.point) return;

    listOfTakeoffs.value.push(
      L.marker([site.point.coordinates[1], site.point.coordinates[0]], {
        icon: createRegionIcon(site),
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
</script>

<style scoped>
#mapContainer {
  min-height: 75vh;
}
</style>
}
