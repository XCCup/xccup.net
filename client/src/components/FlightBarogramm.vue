<template>
  <!-- Stats -->
  <div class="">
    <div id="statsCollapse" class="collapse container">
      <div class="row row-cols-2 row-cols-md-4 my-2">
        <div class="col">
          <i class="bi bi-cloud-upload"></i>
          {{ altitudeToShow }} m
        </div>
        <div class="col">
          <i class="bi bi-arrows-expand"></i>
          {{
            flightStats[1]?.speed
              ? Math.round(flightStats[1]?.climb * 10) / 10
              : "0"
          }}
          m/s
        </div>
        <div class="col">
          <i class="bi bi-speedometer2"></i>
          {{ flightStats[1]?.speed ? Math.floor(flightStats[1]?.speed) : "0" }}
          km/h
        </div>
        <div class="col">
          <i class="bi bi-clock"></i> {{ flightStats[1]?.time }}
        </div>
      </div>
    </div>
  </div>

  <!-- Baro -->
  <div class="container">
    <canvas ref="ctx"></canvas>
  </div>
  <div id="altSwitchCollapse" class="collapse container">
    <div class="form-check form-switch mb-3">
      <input
        id="flexSwitchCheckChecked"
        v-model="pressureAltToggle"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :disabled="airbuddiesInUse"
      />
      <label class="form-check-label" for="flexSwitchCheckChecked"
        >Barometrische Höhe anzeigen (ISA)</label
      >
    </div>
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
import { Collapse } from "bootstrap";

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

// UI Elements
const pressureAltToggle = ref(false);

// Only show pressure alt switch if pressure alt is present in flight fixes
const showPressureAltSwitch = computed(() =>
  flight.value.fixes[0].pressureAltitude ? true : false
);

const usePressureAlt = computed(() =>
  airbuddiesInUse.value ? false : pressureAltToggle.value
);

const altitudeToShow = computed(() => {
  if (usePressureAlt.value && !airbuddiesInUse.value)
    return flightStats.value[1]?.pressureAltitude
      ? Math.floor(flightStats.value[1]?.pressureAltitude)
      : 0;

  return flightStats.value[1]?.gpsAltitude
    ? Math.floor(flightStats.value[1]?.gpsAltitude)
    : 0;
});

const chartData = computed(() =>
  processBaroData(flight.value, activeAirbuddyFlights.value, {
    usePressureAlt: usePressureAlt.value,
  })
);
let statsCollapse = null;
let altSwitchCollapse = null;

watchEffect(() => {
  if (airbuddiesInUse.value) {
    pressureAltToggle.value = false;
    statsCollapse.hide();
    altSwitchCollapse.hide();
  } else {
    if (statsCollapse) {
      statsCollapse.show();
      if (showPressureAltSwitch.value) altSwitchCollapse.show();
    }
  }
});
const flightStats = ref([{}]);

const updateFlightStats = (context) => {
  flightStats.value[context.datasetIndex] = {
    speed: context.raw.speed,
    gpsAltitude: context.raw.gpsAltitude,
    pressureAltitude: context.raw.pressureAltitude,
    climb: context.raw.climb,
    name: context.dataset.label,
    time: context.label,
  };
};

const chart = shallowRef(null);

// Watch and update the chart
watchEffect(() => {
  if (chart.value) {
    chart.value.data.datasets = chartData.value;
    chart.value.options.scales.y.title.text = usePressureAlt.value
      ? "Baro Höhe"
      : "GPS Höhe";
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
  if (ctx.value) chart.value = new Chart(ctx.value, config);

  const statsCollapseEl = document.getElementById("statsCollapse");
  statsCollapse = new Collapse(statsCollapseEl, {
    toggle: true,
  });

  const altSwitchCollapseEl = document.getElementById("altSwitchCollapse");
  altSwitchCollapse = new Collapse(altSwitchCollapseEl, {
    toggle: showPressureAltSwitch.value,
  });
});

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const options = {
  responsive: true,
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
          updateFlightStats(context);
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
      borderWidth: 2,
      tension: 1,
    },
    point: {
      pointBorderWidth: 0,
      pointRadius: 0,
    },
  },
};

const config = {
  type: "line",
  data: {
    datasets: chartData.value,
  },
  options: options,
};
</script>

<style scoped></style>
