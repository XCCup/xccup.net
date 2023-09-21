import { computed, ref } from "vue";
import useMapPosition from "./useMapPosition";
import useChartMouseOver from "./useChartMouseOver";

const { getPositions } = useMapPosition();
const { simulateMouseOver } = useChartMouseOver();

const MAX_REPLAY_FACTOR = 11;
const INTERVAL_MS = 1000;
const FLIGHT_FIXES_INTERVAL_S = 5;

let timer: ReturnType<typeof setInterval>;

const replayFactor = ref(0);
const isStopped = ref(true);

const isOnReplay = ref(false);

let position = 0;
// let preventDoubleEvent = false;

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    console.log("interval");

    position += 1;

    // if (preventDoubleEvent) return (preventDoubleEvent = false);
    // preventDoubleEvent = true;

    simulateMouseOver(position);
    // simulateMouseOver(getPositions.value[0].position + 1);
  }, INTERVAL_MS / replayFactor.value);
}

export default () => {
  const startReplay = () => {
    console.log("start");

    position = getPositions.value[0].position;

    isOnReplay.value = true;
    isStopped.value = false;
    replayFactor.value = 1;
    resetTimer();
  };

  // const stopReplay = () => {};

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

  // const updateReplayPosition = (newPosition: number) => {
  // const delta = Math.abs(position - newPosition);
  // // if (preventDoubleEvent) return (preventDoubleEvent = false);
  // // preventDoubleEvent = true;
  // console.log("delta:", delta);
  // if (delta > 100 && !preventDoubleEvent) {
  //   console.log("set");
  //   position = newPosition;
  //   preventDoubleEvent = true;
  // }
  // if (Math.abs(position - newPosition) < 2) {
  //   console.log("reset");
  //   preventDoubleEvent = false;
  // }
  // console.log("cur:", position);
  // };

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
    // updateReplayPosition,
  };
};
