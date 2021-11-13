<template>
  <div class="container">
    <span class="badge bg-primary">Höhe: {{ altitudeLabels[1] }}</span>
  </div>
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

export default {
  name: "FlightBarogramm",
  props: {
    labels: { type: Array, required: true },
    datasets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
      altitudeLabels: [],
    };
  },
  computed: {
    activeDatasets() {
      return this.datasets.filter((e) => e.data.length > 0);
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
                // Update marker position on map view event listener
                const event = new CustomEvent("markerPositionUpdated", {
                  detail: {
                    dataIndex: context.dataIndex,
                    datasetIndex: context.datasetIndex,
                  },
                });
                document.dispatchEvent(event);
                this.updateAltitudeLabels(context);

                // updateAltitudeLabels(context);

                // Alternative via state:
                // Update pilot marker positions in state via delegate function
                // const markerPosition = {
                //   datasetIndex: context.datasetIndex,
                //   dataIndex: context.dataIndex,
                // };
                // updateMarkerMapPosition(markerPosition);
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
    });
  },
  methods: {
    updateAltitudeLabels(context) {
      this.altitudeLabels[context.datasetIndex] = `${context.raw.y}m`;
      // console.log(raw.y);
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
