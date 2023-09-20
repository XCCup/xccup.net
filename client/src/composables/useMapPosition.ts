import { throttle } from "lodash-es";
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

/** Updates the map position state and extracts the needed data from the
 * context of the baro hover callback. GND dataset (index: 0) is skipped as
 * is it not needed. IGC track 1 becomes index: 0 (context.datasetIndex - 1)
 */

const throttled = throttle((context: BaroTooltipItem) => {
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

/** Reset throttle cache when datasetIndex changes.
 * Otherwise airbuddy tracks may not get updated because of
 * the throttling of the main flight.
 * TODO: Find a way to still prevent too frequent updates of the same
 * index even if there was an update of another track inbetween
 */
let throttleDatasetIndexCache: number | null = null;
const update = (context: BaroTooltipItem) => {
  if (context.datasetIndex != throttleDatasetIndexCache) throttled.cancel();

  throttled(context);
  throttleDatasetIndexCache = context.datasetIndex;
};

export default () => {
  const getPositions = computed(() => state.value);

  const updatePosition = (context: BaroTooltipItem) => {
    update(context);
  };

  const increasePosition = () => {
    state.value.forEach((v) => {
      v.position += 1;
    });
  };

  return { getPositions, updatePosition, increasePosition };
};
