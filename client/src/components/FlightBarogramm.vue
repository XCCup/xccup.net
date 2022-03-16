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
        m /
        {{
          labelData[1]?.pressureAltitude
            ? Math.floor(labelData[1]?.pressureAltitude)
            : "0"
        }}
        m (ISA)
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
    <LineChart :chart-data="baroDatasets" :options="options2" :height="150" />
  </div>
</template>

<script setup>
import { Chart, Interaction, registerables } from "chart.js";
import { ref, computed } from "vue";
import { LineChart } from "vue-chart-3";
import { processBaroData } from "../helper/baroHelpers";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";
// TODO: Replace all date-fns with luxon?
import "chartjs-adapter-luxon";

import { CrosshairPlugin, Interpolate } from "chartjs-plugin-crosshair";

// Chart.register(
//   LineElement,
//   PointElement,
//   LineController,
//   LinearScale,
//   TimeScale,
//   Filler,
//   Legend,
//   Title,
//   Tooltip,
//   CrosshairPlugin
// );

Chart.register(...registerables, CrosshairPlugin);

Interaction.modes.interpolate = Interpolate;

const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";

const { flight } = useFlight();
const { activeAirbuddyFlights, airbuddiesInUse } = useAirbuddies();

const labelData = ref([{}]);

const baroDatasets = computed(() => {
  if (!activeAirbuddyFlights.value[0]) return [];
  return processBaroData(flight.value, []);
  // return processBaroData(flight.value, activeAirbuddyFlights.value);
});

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

// const options = {
//   type: "line",
//   data: {
//     // labels: this.labels,
//     datasets: baroDatasets.value,
//   },
//   options: {
//     onClick: () => {
//       // Center map at current position
//       const centerMapEvent = new CustomEvent("centerMapOnClick");
//       document.dispatchEvent(centerMapEvent);
//     },
//     maintainAspectRatio: false,
//     plugins: {
//       title: {
//         display: false,
//         text: "Barogramm",
//       },
//       legend: {
//         display: false,
//       },
//       crosshair: {
//         line: {
//           color: "#GGG", // crosshair line color
//           width: 1, // crosshair line width
//         },
//       },

//       tooltip: {
//         enabled: false,
//         mode: "x",
//         intersect: false,
//         animation: {
//           duration: 5,
//         },
//         // This does nothing but it is needed to trigger the callback
//         // even if the tooltip is disabled
//         external: function () {},
//         callbacks: {
//           label: (context) => {
//             // Skip GND dataset
//             if (context.datasetIndex === 0) return;

//             // Update marker position on map view event listener
//             const event = new CustomEvent("markerPositionUpdated", {
//               detail: {
//                 dataIndex: context.dataIndex,
//                 datasetIndex: context.datasetIndex,
//               },
//             });
//             document.dispatchEvent(event);
//             updateLabels(context);
//           },
//         },
//       },
//     },

//     scales: {
//       x: {
//         type: "time",
//         time: {
//           round: "second",
//           displayFormats: {
//             minute: "HH:mm",
//             hour: "HH:mm",
//           },
//           tooltipFormat: "HH:mm",
//           minUnit: "hour",
//         },
//         adapters: {
//           date: {
//             zone: tz,
//           },
//         },
//         title: {
//           display: false,
//           text: "Date",
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "GPS Höhe",
//         },
//         beginAtZero: true,
//         ticks: {
//           callback: function (value) {
//             return value + "m";
//           },
//         },
//       },
//     },
//   },
// };

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const options2 = {
  maintainAspectRatio: false,
  responsive: true,

  onClick: () => {
    // Center map at current position
    const centerMapEvent = new CustomEvent("centerMapOnClick");
    document.dispatchEvent(centerMapEvent);
  },
  plugins: {
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
          // Update baro stats for main flight only
          if (context.datasetIndex != 1) return;
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
  elements: {
    line: {
      borderWith: 2,
      tension: 1,
    },
    point: {
      pointBorderWidth: 0,
      pointRadius: 0,
      pointHoverRadius: 0,
    },
  },
};
</script>
