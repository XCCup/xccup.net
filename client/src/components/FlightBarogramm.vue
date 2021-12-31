<template>
  <div class="container">
    <table id="positionStatsTable" class="table table-sm">
      <tbody>
        <tr>
          <td class="col-4 col-md-2">
            <i class="bi bi-cloud-upload"></i>
            {{
              labelData[1]?.altitude ? Math.floor(labelData[1]?.altitude) : "0"
            }}
            m
          </td>

          <td class="col-4 col-md-2">
            <i class="bi bi-arrows-expand"></i>
            {{
              labelData[1]?.speed
                ? Math.round(labelData[1]?.climb * 10) / 10
                : "0"
            }}
            m/s
          </td>
          <td class="col-4 col-md-2">
            <i class="bi bi-speedometer2"></i>
            {{ labelData[1]?.speed ? Math.floor(labelData[1]?.speed) : "0" }}
            km/h
          </td>
          <td class=""></td>
        </tr>
        <!-- <tr v-for="(_, index) in statsTableData" :key="index">
          <td class="col-3">
            Name:
            {{ labelData[index]?.name ?? "" }}
          </td>
          <td class="col-3">
            <i class="bi bi-arrow-bar-up"></i>
            {{
              labelData[index]?.altitude
                ? Math.floor(labelData[index]?.altitude)
                : "0"
            }}
            m
          </td>
          <td class="">
            <i class="bi bi-speedometer2"></i>
            {{
              labelData[index]?.speed
                ? Math.floor(labelData[index]?.speed)
                : "0"
            }}
            km/h
          </td>
          <td class="col-3">
            <i class="bi bi-arrows-expand"></i>
            {{
              labelData[index]?.speed
                ? Math.floor(labelData[index]?.climb)
                : "0"
            }}
            m/s
          </td>
        </tr> -->
      </tbody>
    </table>
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
} from "chart.js";

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

import "chartjs-adapter-date-fns";
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

const { flight } = useFlight();
const { activeAirbuddyFlights } = useAirbuddies();

const chart = shallowRef(null);
const labelData = ref([{}]);

const baroDatasets = computed(() =>
  processBaroData(flight.value, activeAirbuddyFlights.value)
);

const updateLabels = (context) => {
  labelData.value[context.datasetIndex] = {
    speed: context.raw.speed,
    altitude: context.raw.y,
    climb: context.raw.climb,
    name: context.dataset.label,
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
          tooltipFormat: "HH:mm:ss",
          minUnit: "hour",
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
