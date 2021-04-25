<template>
  <div class="container-fluid mt-0">
    <div style="height: 430px">
      <l-map
        ref="map"
        v-model="zoom"
        v-model:zoom="zoom"
        :center="[50.143, 7.146]"
      >
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
        accessToken:
          "pk.eyJ1IjoiYmx1ZW9yYyIsImEiOiJja205bm12ajIxNGV0MndsYWVqeDc4enE3In0.38AVZ2_Gjy_ST_4LxcgahA",
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
      this.track = this.$refs.track;
      this.map.fitBounds(this.track.getBounds());
      // console.log(this.track);
      // console.log(this.map);
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
