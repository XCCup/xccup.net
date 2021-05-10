<template>
  <div class="container-fluid mt-0">
    <div style="height: 430px">
      <l-map ref="map" v-model="zoom" v-model:zoom="zoom">
        <l-tile-layer
          url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}"
          :options="tileOptions"
        ></l-tile-layer>
        <l-polyline
          v-for="(track, index) in tracklogs"
          ref="track"
          :key="index"
          :lat-lngs="track"
          :color="trackColors[index]"
          @ready="doSomethingOnReady"
        ></l-polyline>
        <!-- <l-marker :lat-lng="takeoff">
          <l-tooltip>Start</l-tooltip>
        </l-marker>
        <l-marker :lat-lng="landingField">
          <l-tooltip>Landeplatz</l-tooltip>
        </l-marker> -->
      </l-map>
    </div>
  </div>
  <button class="btn btn-primary" @click="doSomethingOnReady()">
    getBounds()
  </button>
</template>

<script>
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import trackColors from "@/assets/js/trackColors";
import {
  LMap,
  LIcon,
  LTileLayer,
  LMarker,
  LControlLayers,
  LTooltip,
  LPopup,
  LPolyline,
  LPolygon,
  LRectangle,
} from "@vue-leaflet/vue-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
    // LMarker,
    // LTooltip,
    LPolyline,
  },
  name: "Map",
  data() {
    return {
      map: null,
      zoom: 8,
      track: null,
      tracks: Array,
      markers: Array,
      trackColors: trackColors,
      tileOptions: {
        // maxZoom: 18,
        id: "mapbox/outdoors-v11",
        // tileSize: 512,
        // zoomOffset: -1,
        // preferCanvas: true,
        r: "@2x",
        accessToken: process.env.VUE_APP_MAPBOX_API_KEY,
      },
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
  async beforeMount() {
    // HERE is where to load Leaflet components!
    // const { getBounds } = await import("leaflet/dist/leaflet-src.esm");
  },
  methods: {
    doSomethingOnReady() {
      this.map = this.$refs.map.leafletObject;
      this.track = this.$refs.track.leafletObject;
      const trackBounds = this.track.getBounds();
      this.map.fitBounds(trackBounds);
    },
  },
  computed: {
    takeoff() {
      return this.tracklogs[0][0];
    },
    landingField() {
      return this.tracklogs[0][this.tracklogs[0].length - 1];
    },
  },
  watch: {},
};
</script>

<style scoped>
#mapContainer {
  height: 430px;
}
</style>
