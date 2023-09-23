import useMapPosition from "@/composables/useMapPosition";
import type { ChartOptions } from "chart.js";
import type { BaroTooltipItem } from "@/composables/useMapPosition";
import { getXccupTimezone } from "@/helper/utils";

const { updatePosition } = useMapPosition();

export const options: ChartOptions<"line"> = {
  responsive: true,
  onClick: (evt) => {
    // Center map at current position
    const centerMapEvent = new CustomEvent("centerMapOnClick", {
      detail: {
        x: evt.x,
      },
    });
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
        label: (context: BaroTooltipItem) => {
          if (context.datasetIndex === 0) return "";
          updatePosition(context);
          return "";
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
      adapters: {
        date: {
          zone: getXccupTimezone(),
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
        callback: function (value: string | number) {
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
      borderWidth: 0,
      radius: 0,
    },
  },
};
