import { throttle } from "lodash";
import { computed, ref } from "vue";

const state = ref<MapPosition[]>([]);

export interface MapPosition {
  position: number;
  time: number;
}

const update = throttle((index: number, position: number, time: number) => {
  state.value[index] = { position, time };
}, 15);

export default () => {
  const getPositions = computed(() => state.value);
  const updatePosition = (index: number, position: number, time: number) => {
    update(index, position, time);
  };

  return { getPositions, updatePosition };
};
