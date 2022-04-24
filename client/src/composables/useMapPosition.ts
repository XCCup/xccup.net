import { computed, ref } from "vue";

const state = ref<number[]>([]);

export default () => {
  const getPositions = computed(() => state.value);
  const updatePosition = (index: number, position: number) => {
    state.value[index] = position;
  };

  return { getPositions, updatePosition };
};
