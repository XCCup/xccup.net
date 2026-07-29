<template>
  <div class="container-fluid mt-0">
    <div class="row">
      <div id="mapContainer" class="darken-map">
        <div class="leaflet-bottom">
          <div class="leaflet-left">
            <div class="row">
              <button
                class="btn btn-primary leaflet-control col-auto"
                title="Vergrößere Kartenausschnitt"
                @click="toggleMapSize"
              >
                <i
                  class="bi"
                  :class="
                    mapExpanded ? 'bi-arrows-collapse' : 'bi-arrows-expand'
                  "
                ></i>
              </button>
              <button
                class="btn btn-primary leaflet-control col-auto"
                title="Fokussiere Karte auf aktuelle Position"
                @click="requestCenter"
                @dblclick.stop
              >
                <i class="bi bi-crosshair"></i>
              </button>
              <FlightReplayStart />
            </div>
            <FlightReplayControls class="add-gap-leaflet-attribution" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { ADDITIONAL_COLORS } from "@/common/Constants";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";
import useAuth from "@/composables/useAuth";
import useFlightCursor, {
  type FlightCursorSnapshot,
} from "@/composables/useFlightCursor";
import { getTime, parseISO } from "date-fns";
import {
  convertMapBoundsToQueryString,
  drawAirspaces,
  drawAirspaceViolationMarkers,
  processTracklogs,
} from "@/helper/mapHelpers";
import {
  watch,
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  type DeepReadonly,
} from "vue";
import type { SimpleFix } from "@/helper/mapHelpers";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";
import landingIconRetinaUrl from "@/assets/images/landing-marker-2x.png?url";
import landingIconUrl from "@/assets/images/landing-marker.png?url";
import photoIconRetinaUrl from "@/assets/images/photo-marker-2x.png?url";
import photoIconUrl from "@/assets/images/photo-marker.png?url";
import { tileOptionsSatellite, tileOptions } from "../config/mapbox";
import type { FlightTurnpoint } from "@/types/Flight";
import { retrieveYearOnly } from "@/helper/utils";
import { registerLeafletGestureHandling } from "@/helper/leafletGestureHandling";

const { flight } = useFlight();
const { activeAirbuddyFlights } = useAirbuddies();
const { isAdmin } = useAuth();
const { onCommit, onCenter, requestCenter, snapshot } = useFlightCursor();

const trackColors = ADDITIONAL_COLORS;
const landingMarker = L.icon({
  iconRetinaUrl: landingIconRetinaUrl,
  iconUrl: landingIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});
const photoMarker = L.icon({
  iconRetinaUrl: photoIconRetinaUrl,
  iconUrl: photoIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

let map: L.Map | undefined;
let trackLines: Array<L.Polyline | undefined> = [];
let positionMarkers: Array<L.CircleMarker | undefined> = [];
let markerIndexes: Array<number | undefined> = [];
let staticLayers: L.Layer[] = [];
let renderedFlightId: string | undefined;
let fitBoundsTimer: ReturnType<typeof setTimeout> | undefined;
let stopTrackWatch: (() => void) | undefined;
let stopCursorCommit: (() => void) | undefined;
let stopCenterListener: (() => void) | undefined;

const tracklogs = computed(() => {
  if (!flight.value) return [];
  return processTracklogs(flight.value, activeAirbuddyFlights.value);
});

function removeTrackLayer(index: number) {
  trackLines[index]?.remove();
  positionMarkers[index]?.remove();
  trackLines[index] = undefined;
  positionMarkers[index] = undefined;
  markerIndexes[index] = undefined;
}

function clearLayers() {
  trackLines.forEach((_, index) => removeTrackLayer(index));
  trackLines = [];
  positionMarkers = [];
  markerIndexes = [];
  staticLayers.forEach((layer) => layer.remove());
  staticLayers = [];
}

function drawTurnpoints(turnpointData: DeepReadonly<FlightTurnpoint[]>) {
  if (!map || !turnpointData?.length) return;
  const turnpoints: L.LatLngTuple[] = turnpointData.map((tp) => [
    tp.lat,
    tp.long,
  ]);
  staticLayers.push(L.polyline(turnpoints, { color: "grey" }).addTo(map));
}

function drawPrimaryStaticLayers(track: SimpleFix[]) {
  if (!map || !track.length) return;

  staticLayers.push(
    L.marker(track[0].position, { title: "Start" }).addTo(map),
    L.marker(track[track.length - 1].position, {
      title: "Landeplatz",
      icon: landingMarker,
    }).addTo(map)
  );

  const roundBy = 5000;
  const photoTimestamps = flight.value?.photos
    ?.filter((photo) => photo.timestamp)
    .map((photo) => ({
      time: getTime(parseISO(photo.timestamp!.toString())),
      id: photo.id,
    }));

  photoTimestamps?.forEach((photo) => {
    const location = track.find(
      (fix) =>
        Math.floor(fix.timestamp / roundBy) === Math.floor(photo.time / roundBy)
    );
    if (!location) return;
    staticLayers.push(
      L.marker(location.position, { title: "Photo", icon: photoMarker })
        .on("click", () => document.getElementById(photo.id)?.click())
        .addTo(map!)
    );
  });
}

function addTrackLayer(track: SimpleFix[], index: number) {
  if (!map || !track.length) return;
  trackLines[index] = L.polyline(
    track.map((fix) => fix.position),
    { color: trackColors[index] }
  ).addTo(map);
  positionMarkers[index] = L.circleMarker(track[0].position, {
    color: "#fff",
    fillColor: trackColors[index],
    fillOpacity: 0.8,
    radius: 8,
    weight: 2,
    stroke: true,
  }).addTo(map);
  markerIndexes[index] = 0;

  if (index === 0) drawPrimaryStaticLayers(track);
}

function scheduleInitialFit() {
  if (!map || !trackLines[0]) return;
  clearTimeout(fitBoundsTimer);
  fitBoundsTimer = setTimeout(() => {
    if (!map || !trackLines[0]) return;
    map.invalidateSize();
    map.fitBounds(trackLines[0].getBounds());
  }, 100);
}

function updateMarkerPositions(cursorSnapshot: FlightCursorSnapshot) {
  cursorSnapshot.selections.forEach((selection) => {
    const marker = positionMarkers[selection.slot];
    if (!marker || markerIndexes[selection.slot] === selection.index) return;
    marker.setLatLng([selection.fix.latitude, selection.fix.longitude]);
    markerIndexes[selection.slot] = selection.index;
  });
}

function syncTrackLayers() {
  if (!map) return;
  const nextFlightId = flight.value?.id;
  const flightChanged = nextFlightId !== renderedFlightId;

  if (flightChanged) {
    clearLayers();
    renderedFlightId = nextFlightId;
    if (flight.value?.flightTurnpoints) drawTurnpoints(flight.value.flightTurnpoints);
  }

  const nextTracklogs = tracklogs.value;
  const maxLength = Math.max(trackLines.length, nextTracklogs.length);
  for (let index = 0; index < maxLength; index += 1) {
    const track = nextTracklogs[index] ?? [];
    if (!track.length) {
      removeTrackLayer(index);
      continue;
    }
    if (!trackLines[index]) addTrackLayer(track, index);
  }

  if (flightChanged) scheduleInitialFit();
  if (snapshot.value) updateMarkerPositions(snapshot.value);
}

function centerMapOnCursor() {
  const marker = positionMarkers[0];
  if (map && marker) map.setView(marker.getLatLng());
}

onMounted(() => {
  registerLeafletGestureHandling();
  const terrain = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptions
  );
  const satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
    tileOptionsSatellite
  );

  map = L.map("mapContainer", {
    // @ts-expect-error Leaflet gesture-handling extends map options.
    gestureHandling: true,
    zoomAnimation: false,
  });
  terrain.addTo(map);
  L.control.layers({ Gelände: terrain, Satellit: satellite }).addTo(map);
  map.setView([50.143, 7.146], 8);

  syncTrackLayers();
  if (trackLines[0]) {
    drawAirspaces(
      map,
      convertMapBoundsToQueryString(trackLines[0]),
      retrieveYearOnly(flight.value?.takeoffTime)
    );
  }
  if (isAdmin.value && flight.value?.airspaceViolations) {
    drawAirspaceViolationMarkers(map, flight.value.airspaceViolations);
  }

  stopTrackWatch = watch(tracklogs, syncTrackLayers);
  stopCursorCommit = onCommit(updateMarkerPositions);
  stopCenterListener = onCenter(centerMapOnCursor);
});

onBeforeUnmount(() => {
  clearTimeout(fitBoundsTimer);
  stopTrackWatch?.();
  stopCursorCommit?.();
  stopCenterListener?.();
  clearLayers();
  map?.remove();
  map = undefined;
});

const mapExpanded = ref(false);
const toggleMapSize = () => {
  mapExpanded.value = !mapExpanded.value;
  setTimeout(() => map?.invalidateSize(), 100);
};
const mapHeight = computed(() => (mapExpanded.value ? "70vh" : "430px"));
</script>

<style scoped>
#mapContainer {
  height: v-bind("mapHeight");
}

.add-gap-leaflet-attribution {
  margin-bottom: 3em;
}

@media (min-width: 458px) {
  .add-gap-leaflet-attribution {
    margin-bottom: 1em;
  }
}
</style>
