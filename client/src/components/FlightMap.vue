<template>
  <div class="container-fluid mt-0">
    <div class="row">
      <div id="mapContainer" :class="userPrefersDark ? 'darken-map' : ''"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { TRACK_COLORS } from "@/common/Constants";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";
import useAuth from "@/composables/useAuth";
import { getTime, parseISO } from "date-fns";

import {
  convertMapBoundsToQueryString,
  drawAirspaces,
  drawAirspaceViolationMarkers,
  processTracklogs,
} from "@/helper/mapHelpers";

import { watch, onMounted, onBeforeUnmount, ref, computed } from "vue";

import type { SimpleFix } from "@/helper/mapHelpers";

// Fix for default marker image paths
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";

// Landing marker
import landingIconRetinaUrl from "@/assets/images/landing-marker-2x.png?url";
import landingIconUrl from "@/assets/images/landing-marker.png?url";

// Photo marker
import photoIconRetinaUrl from "@/assets/images/photo-marker-2x.png?url";
import photoIconUrl from "@/assets/images/photo-marker.png?url";
import { tileOptionsSatellite, tileOptions } from "../config/mapbox";
import type { FlightTurnpoint } from "@/types/Flight";

import useMapPosition, { type MapPosition } from "@/composables/useMapPosition";
const { getPositions } = useMapPosition();

let landingMarker = L.icon({
  iconRetinaUrl: landingIconRetinaUrl,
  iconUrl: landingIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

let photoMarker = L.icon({
  iconRetinaUrl: photoIconRetinaUrl,
  iconUrl: photoIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const { flight } = useFlight();
const { activeAirbuddyFlights } = useAirbuddies();
const { isAdmin } = useAuth();

const trackColors = TRACK_COLORS;

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

// Leaflet objects

let map: L.Map;
const trackLines = ref();
const positionMarkers = ref<L.CircleMarker[]>([]);
const takeoffAndLandingMarkers: L.Marker[] = [];
const photoMarkers: L.Marker[] = [];

// All tracklogs that shall be drawn on map
const tracklogs = computed(() => {
  if (!flight.value) return [];
  // @ts-expect-error TODO: Check how to type the readonly refs
  return processTracklogs(flight.value, activeAirbuddyFlights.value);
});

onMounted(() => {
  // Setup leaflet
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

  /**
   * Vue 3 with leaflet causes some errors when zooming.
   * Therefore zoomAnimation was disabled.
   * See: https://stackoverflow.com/questions/65981712/uncaught-typeerror-this-map-is-null-vue-js-3-leaflet
   * TODO: Reevaluated with error is still present in future versions (2022-01-31)
   */
  map = L.map("mapContainer", {
    // @ts-expect-error
    gestureHandling: true,
    zoomAnimation: false,
  });

  terrain.addTo(map);
  L.control.layers(baseMaps).addTo(map);
  map.setView([50.143, 7.146], 8);

  // Fix for default marker image paths
  // @ts-expect-error
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.imagePath = "/";
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
  // Draw tracklogs and Airspaces
  // @ts-expect-error TODO: Check how to type the readonly refs
  drawTurnpoints(flight.value?.flightTurnpoints);

  if (tracklogs.value) {
    drawTracks(tracklogs.value);
  }
  drawAirspaces(map, convertMapBoundsToQueryString(trackLines.value[0]));

  if (isAdmin.value) {
    // @ts-expect-error TODO: readonly refs…
    drawAirspaceViolationMarkers(map, flight.value?.airspaceViolations);
  }

  // Watch the tracklogs for updated content like airbuddy flights
  watch(tracklogs, () => drawTracks(tracklogs.value));
});

onBeforeUnmount(() => {
  // Remove the center map on click listener
  document.removeEventListener("centerMapOnClick", centerMapOnClickListener);
});

// Update map
const drawTracks = (tracklogs: SimpleFix[][]) => {
  let lines: L.Polyline[] = [];
  let tmpPositionMarkers: L.CircleMarker[] = [];

  // Remove all trackLines & position markers to prevet orphaned ones
  if (positionMarkers.value.length > 0) {
    positionMarkers.value.forEach((_, index) => {
      trackLines.value[index].remove();
      positionMarkers.value[index].remove();
    });
  }

  tracklogs.forEach((track, index) => {
    if (!map) return;
    // Check if a previously drawn track is removed
    if (track.length > 0) {
      // Create a line for every track
      lines[index] = L.polyline(
        track.map((u) => u.position),
        {
          color: trackColors[index],
        }
      ).addTo(map);

      // Only for main tracklog:
      if (index === 0) {
        // Center map view on first track
        map.fitBounds(lines[0].getBounds());

        // Create takeoff & landing markers
        takeoffAndLandingMarkers.push(
          L.marker(track[0].position, { title: "Start" }).addTo(map),
          L.marker(track[track.length - 1].position, {
            title: "Landeplatz",
            icon: landingMarker,
          }).addTo(map)
        );

        // Create Photomarkers
        const roundBy = 5000; // Approximate values of GPS fix and photo timestamp
        const photoTimestamps = flight.value?.photos?.map((e) => {
          return { time: getTime(parseISO(e.timestamp)), id: e.id };
        });
        if (!photoTimestamps) return;
        // Find matching GPS and photo timestamps
        photoTimestamps.forEach((photo) => {
          const location = track.find((fix) => {
            const minuteOfFix = Math.floor(fix.timestamp / roundBy);
            const minuteOfPhoto = Math.floor(photo.time / roundBy);
            return minuteOfFix === minuteOfPhoto;
          });
          if (!location) return;
          photoMarkers.push(
            L.marker(location.position, { title: "Photo", icon: photoMarker })
              .on("click", () => {
                // TODO: There may be a smarter way to do this
                const el = document.getElementById(photo.id);
                // Simulate click on photo element to open the lightbox modal
                if (!el) return;
                el.click();
              })
              .addTo(map)
          );
        });
      }
      // Create position markers for every track
      tmpPositionMarkers[index] = L.circleMarker(track[0].position, {
        color: "#fff",
        fillColor: trackColors[index],
        fillOpacity: 0.8,
        radius: 8,
        weight: 2,
        stroke: true,
      }).addTo(map);
    }
  });

  // Update data
  trackLines.value = lines;
  positionMarkers.value = tmpPositionMarkers;
};
// Turnpoints of the scored flight
const drawTurnpoints = (turnpointData: FlightTurnpoint[]) => {
  if (!turnpointData) return;
  const turnpoints: L.LatLngTuple[] = [];
  turnpointData.forEach((tp) => {
    turnpoints.push([tp.lat, tp.long]);
  });
  L.polyline(turnpoints, {
    color: "grey",
  }).addTo(map);
};

// Center map on baro click listener
const centerMapOnClickListener = () => {
  if (!map) return;
  map.setView(positionMarkers.value[0].getLatLng());
};
document.addEventListener("centerMapOnClick", centerMapOnClickListener);

const updateMarkerPosition = (position: MapPosition[]) => {
  if (!map) return;
  position.forEach((pos, index) => {
    const setIndex = index;
    const trackLog = tracklogs.value[setIndex];
    const marker = positionMarkers.value[setIndex];

    if (!trackLog) return;
    const logPosition = trackLog[pos.position];
    if (logPosition && marker) {
      marker.setLatLng(logPosition.position);
    }
  });
};

watch(getPositions, () => updateMarkerPosition(getPositions.value), {
  deep: true,
});
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
