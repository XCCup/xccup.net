<template>
  <div style="height: 100%; width: 100%" class="darken-map">
    <l-map ref="map" :zoom="7" :center="[50.143, 7.146]">
      <l-tile-layer
        :url="url"
        :attribution="tileOptions.attribution"
        :max-zoom="tileOptions.maxZoom"
      ></l-tile-layer>
      <l-polyline
        v-for="({ fixes, name, distance }, index) in liveData"
        :lat-lngs="fixes.map((fix) => [fix.lat, fix.lon])"
        :color="ADDITIONAL_COLORS[index % ADDITIONAL_COLORS.length]"
      >
        <l-circle-marker
          :lat-lng="[fixes.at(-1)?.lat ?? 0, fixes.at(-1)?.lon ?? 0]"
          :radius="6"
          :stroke="true"
          :weight="1"
          :fill-opacity="0.8"
          :fill-color="ADDITIONAL_COLORS[index % ADDITIONAL_COLORS.length]"
          color="#fff"
        >
          <l-tooltip :options="{ permanent: true }">
            <b>{{ name }}</b>
            {{
              typeof distance !== "undefined" ? Math.floor(distance) : "?"
            }}
            km / {{ fixes.at(-1)?.altitude }} m
          </l-tooltip>
        </l-circle-marker>
      </l-polyline>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import ApiService from "@/services/ApiService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { ref, onUnmounted } from "vue";
import { setWindowName } from "@/helper/utils";
import { ADDITIONAL_COLORS } from "@/common/Constants";
import { tileOptions } from "@/config/mapbox";
import {
  LMap,
  LTileLayer,
  LPolyline,
  LTooltip,
  LCircleMarker,
} from "@vue-leaflet/vue-leaflet";

type LiveData = {
  name: string;
  distance?: number;
  fixes: {
    lon: number;
    lat: number;
    timestamp: string;
    altitude: number;
    address: string;
  }[];
};

const map = ref<null | L.Map>(null);
const liveData = ref<null | LiveData[]>(null);

const token = import.meta.env.VITE_MAPBOX_API_KEY;
const url = `https://api.mapbox.com/styles/v1/${tileOptions.id}/tiles/{z}/{x}/{y}@2x?access_token=${token}`;

setWindowName("Live Tracking");

fetchData();

let intervalId: NodeJS.Timeout | null = null;
intervalId = setInterval(fetchData, 5000);

onUnmounted(() => clearInterval(intervalId as NodeJS.Timeout));

async function fetchData() {
  try {
    const { data } = await ApiService.getLiveFlights();
    liveData.value = data;
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped></style>
