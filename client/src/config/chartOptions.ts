import type { ChartOptions } from "chart.js";
import { getXccupTimezone } from "@/helper/utils";

export const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  parsing: false,
  // Airbuddy tracks have independent timestamps, so they cannot use the
  // normalized fast-path which assumes matching indexes across datasets.
  normalized: false,
  events: [],
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
    },
    decimation: {
      enabled: true,
      algorithm: "min-max",
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
