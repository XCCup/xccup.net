import { computed, ref } from "vue";
import useMapPosition from "./useMapPosition";

const { increasePosition } = useMapPosition();

const MAX_REPLAY_FACTOR = 10;
const INTERVAL_MS = 1000;
const FLIGHT_FIXES_INTERVAL_S = 5;

let timer: ReturnType<typeof setInterval>;

const replayFactor = ref(0);

const trackIsOnReplay = ref(false);

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(increasePosition, INTERVAL_MS / replayFactor.value);
}

export default () => {
  const startReplay = () => {
    console.log("start");

    trackIsOnReplay.value = true;
    replayFactor.value = 1;
    resetTimer();
  };

  // const stopReplay = () => {};

  const pauseReplay = () => {
    console.log("pause");

    trackIsOnReplay.value = false;
    replayFactor.value = 0;
    clearInterval(timer);
  };

  const fasterReplay = () => {
    console.log("faster");

    if (replayFactor.value <= MAX_REPLAY_FACTOR)
      replayFactor.value = replayFactor.value + 1;
    resetTimer();
  };

  const slowerReplay = () => {
    console.log("slower");

    if (replayFactor.value > 0) replayFactor.value = replayFactor.value - 1;
    resetTimer();
  };

  const isFasterDisabled = computed(
    () => replayFactor.value == MAX_REPLAY_FACTOR
  );

  const isSlowerDisabled = computed(() => replayFactor.value == 0);

  const replaySpeed = computed(
    () => replayFactor.value * FLIGHT_FIXES_INTERVAL_S + "s"
  );

  return {
    trackIsOnReplay,
    replaySpeed,
    isSlowerDisabled,
    isFasterDisabled,
    startReplay,
    pauseReplay,
    // stopReplay,
    fasterReplay,
    slowerReplay,
  };
};
