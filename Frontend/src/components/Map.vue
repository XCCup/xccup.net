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
      tracks: [],
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
      // console.log(newTrackLogs);
      newTrackLogs.forEach((track, index) => {
        this.tracks[index] = L.polyline(track, {
          color: trackColors[index],
        }).addTo(this.map);
        this.markers[index] = L.circleMarker([51.508, -0.11], {
          color: "#fff",
          fillColor: trackColors[index],
          fillOpacity: 0.8,
          radius: 8,
          weight: 2,
          stroke: true,
        }).addTo(this.map);
      });
      this.map.fitBounds(this.tracks[0].getBounds());
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
      {
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
      }
    ).addTo(this.map);

    this.positionUpdateListener = (event) => {
      let positions = event.detail;
      this.tracklogs.forEach((_, index) => {
        if (positions.datasetIndex === index) {
          if (this.tracklogs[index][positions.dataIndex]) {
            this.markers[index].setLatLng(
              this.tracklogs[index][positions.dataIndex]
            );
          }
        }
      });
      // Center map on pilot - currently too CPU intense
      // if (positions.datasetIndex === 0) {
      //   this.map.setView(this.tracklogs[0][positions.dataIndex]);
      // }
    };
    document.addEventListener("positionUpdated", this.positionUpdateListener);
  },
  unmounted() {
    document.removeEventListener(
      "positionUpdated",
      this.positionUpdateListener
    );
  },
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
