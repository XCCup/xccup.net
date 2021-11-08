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
import { ref } from "@vue/reactivity";
import { watchEffect, onMounted, onBeforeUnmount } from "vue";

let map = ref(null);
let tracks = ref([]);
let positionMarkers = ref([]);
let markers = ref([]);

const props = defineProps({
  tracklogs: {
    type: Array,
    default: () => {
      return [];
    },
  },
  turnpoints: {
    type: Array,
    default: () => {
      return [];
    },
  },
  airspaces: {
    type: Array,
    default: () => {
      return [];
    },
  },
});

// watchEffect(() => drawTracks(props.tracklogs));
// watchEffect(() => drawAirspaces(props.airspaces));

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

  // Draw tracklogs
  drawTracks(props.tracklogs);
  drawTurnpoints(props.turnpoints);
});

onBeforeUnmount(() => {
  // Remove the map position update listener
  document.removeEventListener("positionUpdated", positionUpdateListener);
  // Remove the center map on click listener
  document.removeEventListener("centerMapOnClick", centerMapOnClickListener);
});

const drawAirspaces = (airspaceData) => {
  const options = {
    opacity: 0.1,
    fillOpacity: 0.08,
    color: "red",
  };
  airspaceData.forEach((airspace) => {
    L.geoJSON(airspace.polygon, options)
      .bindPopup(createPopupContent(airspace))
      .addTo(map.value);
  });
};
const drawTracks = (trackData) => {
  let lines = [];
  let tmpPositionMarkers = [];
  let tmpMarkers = [];

  // Remove all tracks & markers to prevet orphaned ones
  if (positionMarkers.value.length > 0) {
    positionMarkers.forEach((_, index) => {
      trackData[index].remove();
      positionMarkers[index].remove();
    });
  }

  trackData.forEach((track, index) => {
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
        markers.value.push(
          L.marker(track[0], { title: "Start" }).addTo(map.value),
          L.marker(track[track.length - 1], { title: "Landeplatz" }).addTo(
            map.value
          )
        );
      }
      // Create position markers for every track
      positionMarkers[index] = L.circleMarker(track[0], {
        color: "#fff",
        fillColor: trackColors[index],
        fillOpacity: 0.8,
        radius: 8,
        weight: 2,
        stroke: true,
      }).addTo(map.value);
    }
  });

  // Event listener for updating marker positions. Input comes from the barogramm component
  let markerPositionUpdateListener = (event) => {
    updateMarkerPosition(event.detail);
  };
  document.addEventListener(
    "markerPositionUpdated",
    markerPositionUpdateListener
  );

  // Center listener
  const centerMapOnClickListener = () => {
    centerMapOnClick();
  };
  document.addEventListener("centerMapOnClick", centerMapOnClickListener);

  // Update data
  tracks = lines;
  markers = tmpMarkers;
  positionMarkers.value = tmpPositionMarkers;
};

const drawTurnpoints = (turnpoints) => {
  if (!turnpoints) return;
  let tmp = [];
  turnpoints.forEach((tp) => {
    tmp.push([tp.lat, tp.long]);
  });
  L.polyline(tmp, {
    color: "grey",
  }).addTo(map.value);
};

const updateMarkerPosition = (position) => {
  props.tracklogs.forEach((_, index) => {
    // Index + 1 because first dataset is GND and we need to skip that one
    if (position.datasetIndex === index + 1) {
      if (props.tracklogs[index][position.dataIndex]) {
        positionMarkers[index].setLatLng(
          props.tracklogs[index][position.dataIndex]
        );
      }
    }
  });
  // Center map on pilot - currently too CPU intense. Needs refactoring
  // if (positions.datasetIndex === 1) {
  //   map.setView(tracklogs[0][positions.dataIndex]);
  // }
};
const centerMapOnClick = () => {
  map.value.setView(positionMarkers[0].getLatLng());
};
const createPopupContent = (airspace) => {
  const content = `Name: ${airspace.name}<br>Class: ${airspace.class}<br>Ceiling: ${airspace.ceiling}<br>Floor: ${airspace.floor}`;
  return content;
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
