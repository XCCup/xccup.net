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
import tileOptions from "@/config/mapbox";
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
    turnpoints: {
      type: Array,
      default: () => {
        // DIRTY
        return [
          { time: "10:18:07", lat: 50.10908333333333, long: 7.108533333333333 },
          { time: "11:54:22", lat: 49.87221666666667, long: 6.871733333333333 },
          { time: "14:25:54", lat: 50.164433333333335, long: 6.7639 },
          { time: "15:51:20", lat: 50.15456666666667, long: 7.171866666666666 },
          { time: "16:04:14", lat: 50.10906666666666, long: 7.108516666666667 },
        ];
      },
    },
  },
  watch: {
    // Check if there are new tracklogs present
    tracklogs(newTracklogs) {
      this.drawTracks(newTracklogs);
    },
  },

  mounted() {
    // Setup leaflet
    L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

    this.map = L.map("mapContainer", {
      gestureHandling: true,
    }).setView([50.143, 7.146], 8);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
      tileOptions
    ).addTo(this.map);

    // Wepback fix for default marker image paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.imagePath = "/";
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    // Draw tracklogs
    this.drawTracks(this.tracklogs);

    this.drawTurnpoints(this.turnpoints);
  },
  beforeUnmount() {
    // Remove the map position update listener
    document.removeEventListener(
      "positionUpdated",
      this.positionUpdateListener
    );
    // Remove the center map on click listener
    document.removeEventListener(
      "centerMapOnClick",
      this.centerMapOnClickListener
    );
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

          // Only for main tracklog:
          if (index === 0) {
            // Center map view on first track
            this.map.fitBounds(lines[0].getBounds());

            // Create takeoff & landing markers
            markers.push(
              L.marker(track[0], { title: "Start" }).addTo(this.map),
              L.marker(track[track.length - 1], { title: "Landeplatz" }).addTo(
                this.map
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
          }).addTo(this.map);
        }
      });

      // Event listener for updating marker positions. Input comes from the barogramm component
      this.markerPositionUpdateListener = (event) => {
        this.updateMarkerPosition(event.detail);
      };
      document.addEventListener(
        "markerPositionUpdated",
        this.markerPositionUpdateListener
      );

      // Center listener
      this.centerMapOnClickListener = () => {
        this.centerMapOnClick();
      };
      document.addEventListener(
        "centerMapOnClick",
        this.centerMapOnClickListener
      );

      // Update data
      this.tracks = lines;
      this.markers = markers;
      this.positionMarkers = positionMarkers;
    },

    drawTurnpoints(turnpoints) {
      let tmp = [];
      turnpoints.forEach((tp) => {
        tmp.push([tp.lat, tp.long]);
      });
      L.polyline(tmp, {
        color: "grey",
      }).addTo(this.map);
    },

    updateMarkerPosition(position) {
      this.tracklogs.forEach((_, index) => {
        // Index + 1 because first dataset is GND and we need to skip that one
        if (position.datasetIndex === index + 1) {
          if (this.tracklogs[index][position.dataIndex]) {
            this.positionMarkers[index].setLatLng(
              this.tracklogs[index][position.dataIndex]
            );
          }
        }
      });
      // Center map on pilot - currently too CPU intense. Needs refactoring
      // if (positions.datasetIndex === 1) {
      //   this.map.setView(this.tracklogs[0][positions.dataIndex]);
      // }
    },
    centerMapOnClick() {
      this.map.setView(this.positionMarkers[0].getLatLng());
    },
  },
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
