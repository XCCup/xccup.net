<template>
  <div class="container">
    <canvas ref="myChart"></canvas>
  </div>
</template>

<script>
//  This helps:
// https://medium.com/risan/vue-chart-component-with-chart-js-db85a2d21288
// https://dev.to/23subbhashit/fetching-and-visualizing-data-in-vue-using-axios-and-chart-js-k2h

import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import store from "../store";

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
    // Currently not in use because .update() crashes
    datasets(newDatasets) {
      // Replace the datasets and call the update() method on Chart.js
      // instance to re-render the chart.
      // this.chart.data.datasets = newDatasets;
      // this.chart.update();
      console.log("updated");
    },
  },

  mounted() {
    // Create a new chart
    this.chart = new Chart(this.$refs.myChart, {
      type: "line",
      data: {
        // labels: this.labels,
        datasets: this.datasets,
      },
      options: options,
    });
  },
};

// Chart options
let options = {
  // responsive: true,
  // parsing: true,
  // locale: "de-DE",
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
      enabled: true,
      mode: "x",
      intersect: false,
      animation: {
        duration: 5,
      },
      // filter: function (tooltipItem, data, third, four,) {
      //   // if (third)
      //   console.log(tooltipItem);
      //   return true;
      // },
      external: function (tooltipModel) {
        // console.log(tooltipModel);
        // if (tooltipModel.tooltip.dataPoints.length > 1) {
        //   const dataPointIdexes = [];
        //   const result = [];
        //   const result1 = [];
        //   tooltipModel.tooltip.dataPoints.forEach((dp, index) => {
        //     if (!dataPointIdexes.includes(dp.datasetIndex)) {
        //       result.push(dp);
        //       dataPointIdexes.push(dp.datasetIndex);
        //       result1.push(tooltipModel.tooltip.body[index]);
        //     }
        //   });
        //   tooltipModel.tooltip.dataPoints = result;
        //   tooltipModel.tooltip.body = result1;
        //   tooltipModel.tooltip.height = 322;
        //   tooltipHeaderHeight +
        //   tooltipItemHeight * tooltipModel.tooltip.body.length;
        // }
      },
      callbacks: {
        label: function (context) {
          if (context.dataset.label == "GND") {
            return;
          }
          var label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + "m";
          }

          // Update marker position on map vie event listener
          const event = new CustomEvent("markerPositionUpdated", {
            detail: {
              dataIndex: context.dataIndex,
              datasetIndex: context.datasetIndex,
            },
          });
          document.dispatchEvent(event);

          // Alternative via state:
          // Update pilot marker positions in state via delegate function
          // const markerPosition = {
          //   datasetIndex: context.datasetIndex,
          //   dataIndex: context.dataIndex,
          // };
          // updateMarkerMapPosition(markerPosition);

          return label;
        },
      },
    },
  },

  scales: {
    x: {
      type: "time",
      // distribution: "linear",
      time: {
        // parser: "HH:mm:ss",
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
};

// Delegate function to update the pilot marker position state from the tooltip callback
// function updateMarkerMapPosition(mapPosition) {
//   store.dispatch("updateMarkerMapPosition", mapPosition);
// }

// Set chart defaults
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
