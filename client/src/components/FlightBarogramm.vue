<template>
  <div class="container">
    <div
      v-if="!airbuddiesInUse"
      id="positionStatsTable"
      class="row row-cols-2 row-cols-md-3 row-cols-lg-4 my-2"
    >
      <div class="col">
        <i class="bi bi-cloud-upload"></i>
        {{ labelData[1]?.altitude ? Math.floor(labelData[1]?.altitude) : "0" }}
        m
        <span v-if="labelData[1]?.pressureAltitude">
          /
          {{
            labelData[1]?.pressureAltitude
              ? Math.floor(labelData[1]?.pressureAltitude)
              : "0"
          }}
          m (ISA)</span
        >
      </div>
      <div class="col">
        <i class="bi bi-arrows-expand"></i>
        {{
          labelData[1]?.speed ? Math.round(labelData[1]?.climb * 10) / 10 : "0"
        }}
        m/s
      </div>
      <div class="col">
        <i class="bi bi-speedometer2"></i>
        {{ labelData[1]?.speed ? Math.floor(labelData[1]?.speed) : "0" }}
        km/h
      </div>
      <div class="col">
        <i class="bi bi-clock"></i> {{ labelData[1]?.time }}
      </div>
    </div>
  </div>
  <div class="container">
    <canvas ref="ctx"></canvas>
  </div>
</template>

<script setup>
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
  Interaction,
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
// TODO: Replace all date-fns with luxon?
import "chartjs-adapter-luxon";

import { CrosshairPlugin, Interpolate } from "chartjs-plugin-crosshair";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Filler,
  Legend,
  Title,
  Tooltip,
  CrosshairPlugin
);
Interaction.modes.interpolate = Interpolate;

const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";

const { flight } = useFlight();
const { activeAirbuddyFlights, airbuddiesInUse } = useAirbuddies();

const chart = shallowRef(null);
const labelData = ref([{}]);

const baroDatasets = computed(() =>
  processBaroData(flight.value, activeAirbuddyFlights.value)
);

const updateLabels = (context) => {
  labelData.value[context.datasetIndex] = {
    speed: context.raw.speed,
    pressureAltitude: context.raw.pressureAltitude,
    altitude: context.raw.y,
    climb: context.raw.climb,
    name: context.dataset.label,
    time: context.label,
  };
};

watchEffect(() => {
  if (chart.value) {
    chart.value.data.datasets = baroDatasets.value;
    chart.value.update();
  }
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const ctx = ref(null);
onMounted(() => {
  // Create a new chart
  if (ctx.value) chart.value = new Chart(ctx.value, options);
});

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const options = {
  type: "line",
  data: {
    // labels: this.labels,
    datasets: baroDatasets.value,
  },
  options: {
    onClick: () => {
      // Center map at current position
      const centerMapEvent = new CustomEvent("centerMapOnClick");
      document.dispatchEvent(centerMapEvent);
    },
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
        text: "Barogramm",
      },
      legend: {
        display: false,
      },
      crosshair: {
        line: {
          color: userPrefersDark.value ? "darkgrey" : "#GGG",
          width: 1,
        },
      },
      tooltip: {
        enabled: false,
        mode: "x",
        intersect: false,
        animation: {
          duration: 5,
        },
        // This does nothing but it is needed to trigger the callback
        // even if the tooltip is disabled
        external: function () {},
        callbacks: {
          label: (context) => {
            // Skip GND dataset
            if (context.datasetIndex === 0) return;

            // Update marker position on map view event listener
            const event = new CustomEvent("markerPositionUpdated", {
              detail: {
                dataIndex: context.dataIndex,
                datasetIndex: context.datasetIndex,
              },
            });
            document.dispatchEvent(event);
            updateLabels(context);
          },
        },
      },
    },

    scales: {
      x: {
        type: "time",
        time: {
          round: "second",
          displayFormats: {
            minute: "HH:mm",
            hour: "HH:mm",
          },
          tooltipFormat: "HH:mm",
          minUnit: "hour",
        },
        adapters: {
          date: {
            zone: tz,
          },
        },
        title: {
          display: false,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "GPS Höhe",
        },
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "m";
          },
        },
      },
    },
  },
};
// Chart options

Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.line.tension = 1;
Chart.defaults.elements.point.pointBorderWidth = 0;
Chart.defaults.elements.point.pointRadius = 0;
//Chart.defaults.elements.point.pointHitRadius = 0;
Chart.defaults.elements.point.pointHoverRadius = 0;
// Chart.defaults.plugins.decimation.enabled = true;
</script>

<style lang="scss" scoped>
// #barogramm {
//   height: 200px;
// }
</style>
