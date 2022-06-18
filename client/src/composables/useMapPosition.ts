import { throttle } from "lodash";
import { computed, ref } from "vue";
import type { TooltipItem } from "chart.js";

const state = ref<MapPosition[]>([]);

interface PositionDetails {
  gpsAltitude?: number;
  pressureAltitude?: number;
  speed?: number;
  time?: string;
  climb?: number;
  name?: string;
}

export interface MapPosition {
  position: number;
  time: number;
  positionDetails: PositionDetails;
}

export interface BaroTooltipItem extends TooltipItem<"line"> {
  raw: {
    speed?: number;
    gpsAltitude?: number;
    pressureAltitude?: number;
    climb?: number;
  };
}

const update = throttle((context: BaroTooltipItem) => {
  state.value[context.datasetIndex - 1] = {
    position: context.dataIndex,
    time: context.parsed.x,
    positionDetails: {
      speed: context.raw.speed,
      gpsAltitude: context.raw.gpsAltitude,
      pressureAltitude: context.raw.pressureAltitude,
      climb: context.raw.climb,
      name: context.dataset.label,
      time: context.label,
    },
  };
}, 15);

export default () => {
  const getPositions = computed(() => state.value);

  const updatePosition = (context: BaroTooltipItem) => {
    // Skip GND dataset and make track 1 => index 0 (context.datasetIndex - 1)
    update(context);
  };

  return { getPositions, updatePosition };
};
