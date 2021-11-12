<template>
  <div class="container-fluid mt-0">
    <div class="row">
      <div id="mapContainer"></div>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import trackColors from "@/assets/js/trackColors";
import tileOptions from "@/config/mapbox";

export default {
  name: "Map",
  props: {
    tracklogs: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      map: null,
      tracks: Array,
      markers: Array,
    };
  },
  watch: {
    tracklogs(newTrackLogs) {
      // console.log(newTrackLogs);
      newTrackLogs.forEach((track, index) => {
        this.tracks[index] = L.polyline(track, {
          color: trackColors[index],
        }).addTo(this.map);

        // Center map view on first track
        if (index === 0) {
          this.map.fitBounds(this.tracks[0].getBounds());
        }
        // Create markers for every track
        this.markers[index] = L.circleMarker([51.508, -0.11], {
          color: "#fff",
          fillColor: trackColors[index],
          fillOpacity: 0.8,
          radius: 8,
          weight: 2,
          stroke: true,
        }).addTo(this.map);
      });
    },
  },
  mounted() {
    L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

    this.map = L.map("mapContainer", {
      // dragging: !L.Browser.mobile,
      // tap: !L.Browser.mobile,
      gestureHandling: true,
    }).setView([50.143, 7.146], 8);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
      tileOptions
    ).addTo(this.map);

    // Event listener for updating marker positions. Input comes from the FlightBarogramm component
    this.positionUpdateListener = (event) => {
      this.updatePositions(event.detail);
    };
    document.addEventListener("positionUpdated", this.positionUpdateListener);
  },
  beforeUnmount() {
    document.removeEventListener(
      "positionUpdated",
      this.positionUpdateListener
    );
  },
  methods: {
    updatePositions(positions) {
      this.tracklogs.forEach((_, index) => {
        // Index + 1 because first dataset is GND ans wee need to skip that one
        if (positions.datasetIndex === index + 1) {
          if (this.tracklogs[index][positions.dataIndex]) {
            this.markers[index].setLatLng(
              this.tracklogs[index][positions.dataIndex]
            );
          }
        }
      });
      // Center map on pilot - currently too CPU intense
      // if (positions.datasetIndex === 1) {
      //   this.map.setView(this.tracklogs[0][positions.dataIndex]);
      // }
    },
  },
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
