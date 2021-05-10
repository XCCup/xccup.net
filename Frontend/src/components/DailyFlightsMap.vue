<template>
  <div id="mapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import tileOptions from "@/config/mapbox";

export default {
  name: "DailyFlightsMap",
  data() {
    return {
      map: null,
      lines: [],
      tracks: [
        {
          flightId: 1,
          turnpoints: [
            { lat: 49.6, long: 6.1 },
            { lat: 50.6, long: 7.6 },
            { lat: 50.3, long: 7.9 },
          ],
        },
        {
          flightId: 2,
          turnpoints: [
            { lat: 49.7, long: 6.8 },
            { lat: 50.2, long: 6.6 },
          ],
        },
        {
          flightId: 3,
          turnpoints: [
            { lat: 50.1, long: 7.3 },
            { lat: 50.2, long: 7.4 },
          ],
        },
        {
          flightId: 4,
          turnpoints: [
            { lat: 50.3, long: 6.5 },
            { lat: 50.4, long: 7.6 },
          ],
        },
        {
          flightId: 5,
          turnpoints: [
            { lat: 49.6, long: 6.1 },
            { lat: 50.6, long: 7.6 },
          ],
        },
      ],
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
    this.drawTracks(this.tracks);
  },
  methods: {
    popup(flightId) {
      return `Flight ID: ${flightId} <br/> <a href>Link</a>`;
    },
    drawTracks(tracks) {
      let trackGroup = new L.featureGroup();
      tracks.forEach((track) => {
        let tmp = [];
        track.turnpoints.forEach((tp) => {
          tmp.push([tp.lat, tp.long]);
        });
        L.polyline(tmp, {
          color: "darkred",
        })
          .bindPopup(this.popup(track.flightId))
          .addTo(trackGroup);
      });
      this.map.addLayer(trackGroup);
      this.map.fitBounds(trackGroup.getBounds());
    },
  },
};
</script>

<style scoped>
#mapContainer {
  height: 100%;
  min-height: 430px;
}
</style>
