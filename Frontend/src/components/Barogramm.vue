<template>
  <div class="container barogramm-container">
    <canvas ref="myChart" height="70"></canvas>
  </div>
</template>

<script>
//  This helps: https://medium.com/risan/vue-chart-component-with-chart-js-db85a2d21288

import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";

export default {
  name: "Barogramm",
  props: {
    labels: Array,
    datasets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    datasets(newDatasets) {
      // Replace the datasets and call the update() method on Chart.js
      // instance to re-render the chart.
      this.chart.data.datasets = newDatasets;

      // this.chart.update();

      console.log("updated");
    },
  },
  mounted() {
    this.chart = new Chart(this.$refs.myChart, {
      type: "line",
      data: {
        // labels: this.labels,
        datasets: this.datasets,
      },
      options: options,
    });
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};

let options = {
  //responsive: true,

  plugins: {
    title: {
      display: false,
      text: "Barogramm",
    },
    legend: {
      display: false,
    },
  },

  scales: {
    x: {
      type: "time",
      //distribution: "linear",
      time: {
        //parser: "HH:mm:ss",
        round: "second",
        displayFormats: {
          minute: "HH:mm",
          hour: "HH:mm",
        },
        tooltipFormat: "HH:mm:ss",
        minUnit: "hour",
      },
      ticks: {},
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
        callback: function (value, index, values) {
          return value + "m";
        },
      },
    },
  },
};

// Barogramm

// Set defaults
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
//   height: 100px;
// }
</style>
