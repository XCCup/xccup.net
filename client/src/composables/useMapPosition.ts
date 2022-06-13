import { computed, ref } from "vue";

const state = ref<MapPosition[]>([]);

export interface MapPosition {
  position: number;
  time: number;
}
export default () => {
  const getPositions = computed(() => state.value);
  const updatePosition = (index: number, position: number, time: number) => {
    state.value[index] = { position, time };
  };

  return { getPositions, updatePosition };
};
