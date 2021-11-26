<template>
  <div class="container-fluid mt-0">
    <div class="row">
      <div id="mapContainer"></div>
    </div>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import tileOptions from "@/config/mapbox";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import trackColors from "@/assets/js/trackColors";
import ApiService from "@/services/ApiService";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";

import {
  convertMapBoundsToQueryString,
  createAirspacePopupContent,
  processTracklogs,
} from "@/helper/mapHelpers";

import { watch, onMounted, onBeforeUnmount, ref, computed } from "vue";

// Fix for default marker image paths
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";

const { flight } = useFlight();
const { activeAirbuddyFlights } = useAirbuddies();

// Leaflet objects
let map = ref(null);
let trackLines = ref();
let positionMarkers = ref([]);
let takeoffAndLandingMarkers = ref([]);

// All tracklogs that shall be drawn on map
const tracklogs = computed(() =>
  processTracklogs(flight.value, activeAirbuddyFlights.value)
);

// Watch the tracklogs for updated content like airbuddy flights
watch(tracklogs, () => drawTracks(tracklogs.value));

onMounted(() => {
  // TODO:
  // Whenever using anything based on OpenStreetMap, an attribution is obligatory as per the copyright notice.
  // Most other tile providers (such as Mapbox, Stamen or Thunderforest) require an attribution as well.
  // Make sure to give credit where credit is due.

  // Setup leaflet
  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

  map.value = L.map("mapContainer", {
    gestureHandling: true,
  }).setView([50.143, 7.146], 8);

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

  // Draw tracklogs and Airspaces
  drawTracks(tracklogs.value);
  drawTurnpoints(flight.value.flightTurnpoints);
  drawAirspaces(convertMapBoundsToQueryString(trackLines.value[0]));
});

onBeforeUnmount(() => {
  // Remove the map position update listener
  document.removeEventListener(
    "markerPositionUpdated",
    markerPositionUpdateListener
  );
  // Remove the center map on click listener
  document.removeEventListener("centerMapOnClick", centerMapOnClickListener);
});

// Airspaces
const drawAirspaces = async (bounds) => {
  const res = await ApiService.getAirspaces(bounds);
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
};

// Update map
const drawTracks = (tracklogs) => {
  let lines = [];
  let tmpPositionMarkers = [];

  // Remove all trackLines & position markers to prevet orphaned ones
  if (positionMarkers.value.length > 0) {
    positionMarkers.value.forEach((_, index) => {
      trackLines.value[index].remove();
      positionMarkers.value[index].remove();
    });
  }

  tracklogs.forEach((track, index) => {
    // Check if a previously drawn track is removed
    if (track.length > 0) {
      // Create a line for every track
      lines[index] = L.polyline(track, {
        color: trackColors[index],
      }).addTo(map.value);

      // Only for main tracklog:
      if (index === 0) {
        // Center map view on first track
        map.value.fitBounds(lines[0].getBounds());

        // Create takeoff & landing markers
        takeoffAndLandingMarkers.value.push(
          L.marker(track[0], { title: "Start" }).addTo(map.value),
          L.marker(track[track.length - 1], { title: "Landeplatz" }).addTo(
            map.value
          )
        );
      }
      // Create position markers for every track
      tmpPositionMarkers[index] = L.circleMarker(track[0], {
        color: "#fff",
        fillColor: trackColors[index],
        fillOpacity: 0.8,
        radius: 8,
        weight: 2,
        stroke: true,
      }).addTo(map.value);
    }
  });

  // Update data
  trackLines.value = lines;
  positionMarkers.value = tmpPositionMarkers;
};
// Turnpoints of the scored flight
const drawTurnpoints = (turnpointData) => {
  if (!turnpointData) return;
  let turnpoints = [];
  turnpointData.forEach((tp) => {
    turnpoints.push([tp.lat, tp.long]);
  });
  L.polyline(turnpoints, {
    color: "grey",
  }).addTo(map.value);
};

// Center map on baro click listener
const centerMapOnClickListener = () => {
  map.value.setView(positionMarkers.value[0].getLatLng());
};
document.addEventListener("centerMapOnClick", centerMapOnClickListener);

// Event listener for updating pilot marker positions. Input comes from the barogramm component
let markerPositionUpdateListener = (event) => {
  updateMarkerPosition(event.detail);
};
document.addEventListener(
  "markerPositionUpdated",
  markerPositionUpdateListener
);

const updateMarkerPosition = (position) => {
  tracklogs.value.forEach((_, index) => {
    // Index + 1 because first dataset is GND and we need to skip that one
    if (position.datasetIndex === index + 1) {
      if (
        tracklogs.value[index][position.dataIndex] &&
        positionMarkers.value[index]
      ) {
        positionMarkers.value[index].setLatLng(
          tracklogs.value[index][position.dataIndex]
        );
      }
    }
  });
  // Center map on pilot - currently too CPU intense. Needs refactoring
  // if (positions.datasetIndex === 1) {
  //   map.setView(tracklogs[0][positions.dataIndex]);
  // }
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
