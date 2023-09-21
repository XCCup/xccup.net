import { computed, ref } from "vue";
import useChartMouseOver from "./useChartMouseOver";

const { simulateMouseOver } = useChartMouseOver();

const MAX_REPLAY_FACTOR = 11;
const INTERVAL_MS = 1000;
const FLIGHT_FIXES_INTERVAL_S = 5;

let timer: ReturnType<typeof setInterval>;

const replayFactor = ref(0);
const isStopped = ref(true);

const isOnReplay = ref(false);

let position = 0;

function resetTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    console.log("interval");

    position += 1;

    simulateMouseOver(position);
    // simulateMouseOver(getPositions.value[0].position + 1);
  }, INTERVAL_MS / replayFactor.value);
}

export default () => {
  const startReplay = () => {
    console.log("start");

    // position = getPositions.value[0].position;

    isOnReplay.value = true;
    isStopped.value = false;
    replayFactor.value = 1;
    resetTimer();
  };

  const pauseReplay = () => {
    console.log("pause");

    isOnReplay.value = false;
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

  const stopReplay = () => {
    console.log("stop");

    clearInterval(timer);
    isStopped.value = true;
    isOnReplay.value = false;
    replayFactor.value = 0;
    position = 0;
    simulateMouseOver(position);
  };

  const updateReplayPosition = (newPosition: number) => {
    console.log("set");
    position = newPosition;
    pauseReplay();
  };

  const isFasterDisabled = computed(
    () => replayFactor.value == MAX_REPLAY_FACTOR
  );

  const isSlowerDisabled = computed(() => replayFactor.value == 0);

  const replaySpeed = computed(
    () => replayFactor.value * FLIGHT_FIXES_INTERVAL_S + "s"
  );

  return {
    isOnReplay,
    isStopped,
    replaySpeed,
    isSlowerDisabled,
    isFasterDisabled,
    startReplay,
    pauseReplay,
    stopReplay,
    fasterReplay,
    slowerReplay,
    updateReplayPosition,
  };
};
