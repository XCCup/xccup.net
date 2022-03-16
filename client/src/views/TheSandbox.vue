<template>
  <h4>Sandbox</h4>
  <LineChart :chart-data="testData" :options="options" />
</template>

<script setup>
// import { ref } from "vue";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-luxon";

const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";

Chart.register(...registerables);

const elevation = [
  { x: 1620901004000, y: 10 },
  { x: 1620901006000, y: 100 },
  { x: 1620901008000, y: 50 },
];
const testData = {
  // labels: ["Paris", "Nîmes", "Toulon", "Perpignan", "Autre"],
  datasets: [
    {
      data: elevation,
      // data: [30, 40, 60, 70, 5],
      // backgroundColor: ["#77CEFF", "#0079AF", "#123E6B", "#97B0C4", "#A5C8ED"],
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
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
          // const event = new CustomEvent("markerPositionUpdated", {
          //   detail: {
          //     dataIndex: context.dataIndex,
          //     datasetIndex: context.datasetIndex,
          //   },
          // });
          // document.dispatchEvent(event);
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
          minute: "HH:mm:ss",
          hour: "HH:mm:ss",
        },
        tooltipFormat: "HH:mm:ss",
        minUnit: "second",
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
};
</script>
