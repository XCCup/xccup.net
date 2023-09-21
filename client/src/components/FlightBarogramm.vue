<script setup lang="ts">
//  This helps:
// https://medium.com/risan/vue-chart-component-with-chart-js-db85a2d21288
// https://dev.to/23subbhashit/fetching-and-visualizing-data-in-vue-using-axios-and-chart-js-k2h

// import Chart from "chart.js/auto"; // Import all for dev purposes

import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Filler,
  Legend,
  Title,
  Tooltip,
  // Interaction,
} from "chart.js";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  watchEffect,
  shallowRef,
} from "vue";
import { processBaroData } from "../helper/baroHelpers";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";
import "chartjs-adapter-luxon";
import { Collapse } from "bootstrap";
import { options } from "@/config/chartOptions";
import useMapPosition from "@/composables/useMapPosition";

import type { ChartConfiguration } from "chart.js";
import { roundWithDigits } from "@/helper/utils";
import useChartMouseOver from "@/composables/useChartMouseOver";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Filler,
  Legend,
  Title,
  Tooltip
);
// Interaction.modes.interpolate = Interpolate;

const { flight } = useFlight();
const { activeAirbuddyFlights, airbuddiesInUse } = useAirbuddies();
const { getPositions } = useMapPosition();
const { initChartMouseOver } = useChartMouseOver();

// UI Elements
const pressureAltToggle = ref(false);

// Only show pressure alt switch if pressure alt is present in flight fixes
const showPressureAltSwitch = computed(() => {
  if (!flight.value?.fixes?.length) return false;
  return flight.value.fixes[0].pressureAltitude ? true : false;
});

const usePressureAlt = computed(() =>
  airbuddiesInUse.value ? false : pressureAltToggle.value
);

const altitudeToShow = computed(() => {
  if (usePressureAlt.value && !airbuddiesInUse.value)
    return getPositions.value[0]?.positionDetails?.pressureAltitude
      ? Math.floor(getPositions.value[0]?.positionDetails?.pressureAltitude)
      : 0;

  return getPositions.value[0]?.positionDetails?.gpsAltitude
    ? Math.floor(getPositions.value[0]?.positionDetails?.gpsAltitude)
    : 0;
});

// Chart data
const chartData = computed(() => {
  if (!flight.value) return [];
  // @ts-expect-error TODO: Evaluate this type error
  return processBaroData(flight.value, activeAirbuddyFlights.value, {
    usePressureAlt: usePressureAlt.value,
  });
});

// Collapse setup
// TODO: TS - Why isn't this of type Collapse | undefined literally?
let positionDetailsCollapse: Collapse | undefined;
let altSwitchCollapse: Collapse | undefined;

onMounted(() => {
  const positionDetailsCollapseEl = document.getElementById(
    "positionDetailsCollapse"
  );
  if (positionDetailsCollapseEl) {
    positionDetailsCollapse = new Collapse(positionDetailsCollapseEl, {
      toggle: true,
    });
  }
  const altSwitchCollapseEl = document.getElementById("altSwitchCollapse");
  if (altSwitchCollapseEl) {
    altSwitchCollapse = new Collapse(altSwitchCollapseEl, {
      toggle: true,
    });
  }
});

// Determine what to show (baro switch / position details)
watchEffect(() => {
  if (airbuddiesInUse.value) {
    pressureAltToggle.value = false;
    positionDetailsCollapse?.hide();
    altSwitchCollapse?.hide();
  } else {
    if (positionDetailsCollapse) {
      positionDetailsCollapse.show();
      if (showPressureAltSwitch.value) altSwitchCollapse?.show();
    }
  }
});

// Chart setup
type ChartType = "line";
const chart = shallowRef<Chart<ChartType>>();
const ctx = ref(null);

// Watch and update the chart
watchEffect(() => {
  // @ts-ignore TODO: I know it's there!
  if (chart.value && chartData.value && chart.value.options?.scales?.y?.title) {
    chart.value.data.datasets = chartData.value;
    // @ts-ignore TODO: I know it's there!
    chart.value.options.scales.y.title.text = usePressureAlt.value
      ? "Baro Höhe"
      : "GPS Höhe";
    chart.value.update();
  }
});

onMounted(() => {
  // Create a new chart
  if (!ctx.value) return;
  let plainChartObject = new Chart<ChartType>(ctx.value, config);
  chart.value = plainChartObject;

  if (!plainChartObject) return;
  // We simulate a first mouseover so that we can pre fill the positionDetailsCollapse and have the first context objects for the track replay feature.
  // Otherwise replay would only start if we mouseover manually over the graph.
  initChartMouseOver(plainChartObject);
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const config: ChartConfiguration<ChartType> = {
  type: "line",
  data: {
    datasets: chartData.value,
  },
  options: options,
};
</script>
<template>
  <!-- TODO: Load initial values for time, height, windspeed, air pressure when loading site -->
  <!-- Position details -->
  <div>
    <div id="positionDetailsCollapse" class="collapse container">
      <div class="row row-cols-2 row-cols-md-4 my-2">
        <div class="col">
          <i class="bi bi-cloud-upload"></i>
          {{ altitudeToShow }} m
        </div>
        <div class="col">
          <i class="bi bi-arrows-expand"></i>
          {{
            getPositions[0]?.positionDetails?.speed
              ? roundWithDigits(getPositions[0]?.positionDetails?.climb ?? 0, 1)
              : "0"
          }}
          m/s
        </div>
        <div class="col">
          <i class="bi bi-speedometer2"></i>
          {{
            getPositions[0]?.positionDetails?.speed
              ? Math.floor(getPositions[0]?.positionDetails?.speed)
              : "0"
          }}
          km/h
        </div>
        <div class="col">
          <i class="bi bi-clock"></i>
          {{ getPositions[0]?.positionDetails?.time }}
        </div>
      </div>
    </div>

    <!-- Baro -->
    <div class="container mt-3">
      <canvas ref="ctx"></canvas>
    </div>
    <!-- Baro Switch -->
    <div
      v-if="flight?.fixes && flight?.fixes[0]?.pressureAltitude"
      id="altSwitchCollapse"
      class="collapse container"
    >
      <div class="form-check form-switch mb-3">
        <input
          id="flexSwitchCheckChecked"
          v-model="pressureAltToggle"
          class="form-check-input"
          type="checkbox"
          role="switch"
          :disabled="airbuddiesInUse"
        />
        <label class="form-check-label" for="flexSwitchCheckChecked">
          Barometrische Höhe anzeigen (ISA)
        </label>
      </div>
    </div>
    <!-- METAR -->
    <div class="container"><FlightMetarStats /></div>
  </div>
</template>

<style scoped></style>
