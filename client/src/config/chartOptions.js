import { ref } from "vue";
const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

export const options = (cb) => ({
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
          cb(context);
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
});