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

export default {
  name: "Map",
  data() {
    return {
      map: null,
      tracks: Array,
      positionMarkers: [],
      markers: [],
    };
  },
  props: {
    tracklogs: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    tracklogs(newTrackLogs) {
      this.drawTracks(newTrackLogs);
    },
  },
  computed: {
    mapPositionFromState() {
      return this.$store.state.mapPosition;
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
    // Wepback fix for marker images in dist
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.imagePath = "/";
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    // Draw tracks
    this.drawTracks(this.tracklogs);

    // Event listener for updating marker positions. Input comes from the Barogramm component
    this.positionUpdateListener = (event) => {
      this.updatePositions(event.detail);
    };
    document.addEventListener("positionUpdated", this.positionUpdateListener);
  },
  methods: {
    drawTracks(tracks) {
      let lines = [];
      let positionMarkers = [];
      let markers = [];

      // Remove all tracks & markers to prevet orphaned ones
      if (this.positionMarkers.length > 0) {
        this.positionMarkers.forEach((_, index) => {
          this.tracks[index].remove();
          this.positionMarkers[index].remove();
        });
      }

      tracks.forEach((track, index) => {
        // Check if a previously drawn track is removed
        if (track.length > 0) {
          // Create a line for every track
          lines[index] = L.polyline(track, {
            color: trackColors[index],
          }).addTo(this.map);
          // Center map view on first track and add takeoff & landing markers
          if (index === 0) {
            this.map.fitBounds(lines[0].getBounds());

            markers.push(
              L.marker(track[0], { title: "Start" }).addTo(this.map),
              L.marker(track[track.length - 1], { title: "Landeplatz" }).addTo(
                this.map
              )
            );
          }
          // Create position markers for every track
          positionMarkers[index] = L.circleMarker([51.508, -0.11], {
            color: "#fff",
            fillColor: trackColors[index],
            fillOpacity: 0.8,
            radius: 8,
            weight: 2,
            stroke: true,
          }).addTo(this.map);
        }
      });
      this.tracks = lines;
      this.markers = markers;
      this.positionMarkers = positionMarkers;
    },
    updatePositions(positions) {
      this.tracklogs.forEach((_, index) => {
        // Index + 1 because first dataset is GND ans wee need to skip that one
        if (positions.datasetIndex === index + 1) {
          if (this.tracklogs[index][positions.dataIndex]) {
            this.positionMarkers[index].setLatLng(
              this.tracklogs[index][positions.dataIndex]
            );
          }
        }
      });
      // Center map on pilot - currently too CPU intense. Needs refactoring
      // if (positions.datasetIndex === 1) {
      //   this.map.setView(this.tracklogs[0][positions.dataIndex]);
      // }
    },
  },
  unmounted() {
    document.removeEventListener(
      "positionUpdated",
      this.positionUpdateListener
    );
  },
};

const tileOptions = {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/outdoors-v11",
  tileSize: 512,
  zoomOffset: -1,
  //preferCanvas: true,
  r: "@2x",
  accessToken:
    "pk.eyJ1IjoiYmx1ZW9yYyIsImEiOiJja205bm12ajIxNGV0MndsYWVqeDc4enE3In0.38AVZ2_Gjy_ST_4LxcgahA",
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
