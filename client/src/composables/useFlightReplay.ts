import { computed, ref } from "vue";
import useChartMouseOver from "./useChartMouseOver";

const { simulateMouseOver } = useChartMouseOver();

const REPLAY_FACTORS = [1, 2, 5, 10, 20, 50, 100];
const INTERVAL_MS = 1000;
const FLIGHT_FIXES_INTERVAL_S = 5;

let timer: ReturnType<typeof setInterval>;
let handleSpaceBarForReplay: (event: KeyboardEvent) => void;
let preventSpacebarPageScrollDown: (event: KeyboardEvent) => void;

const replayFactor = ref(0);
const isStopped = ref(true);
const isOnReplay = ref(false);
const isFollowReplay = ref(false);

let replayFactorBeforePaused = 0;
let position = 0;

function resetTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    position += 1;
    simulateMouseOver(position);
    if (isFollowReplay.value) centerMapOnPosition();
  }, INTERVAL_MS / REPLAY_FACTORS[replayFactor.value]);
}

function centerMapOnPosition() {
  const centerMapEvent = new CustomEvent("centerMapOnClick");
  document.dispatchEvent(centerMapEvent);
}

export default () => {
  const startReplay = () => {
    isOnReplay.value = true;
    isStopped.value = false;
    replayFactor.value = replayFactorBeforePaused;
    resetTimer();
  };

  const pauseReplay = () => {
    isOnReplay.value = false;
    replayFactorBeforePaused = replayFactor.value;
    replayFactor.value = -1;
    clearInterval(timer);
  };

  const fasterReplay = () => {
    if (replayFactor.value < REPLAY_FACTORS.length - 1)
      replayFactor.value = replayFactor.value + 1;
    resetTimer();
  };

  const slowerReplay = () => {
    if (replayFactor.value > 0) replayFactor.value = replayFactor.value - 1;
    resetTimer();
  };

  const stopReplay = () => {
    clearInterval(timer);
    isStopped.value = true;
    isOnReplay.value = false;
    replayFactor.value = 0;
    position = 0;
    simulateMouseOver(position);
  };

  const updateReplayPosition = (newPosition: number) => {
    position = newPosition;
  };

  const followReplayOnMap = (follow: boolean) => {
    isFollowReplay.value = follow;
  };

  const addKeyboardHandler = () => {
    const replayKeyHandler = (event: KeyboardEvent): void => {
      // Use similar shortcuts as YouTube

      // Start / Pause
      if (event.ctrlKey && event.code === "Space") {
        isOnReplay.value ? pauseReplay() : startReplay();
      }
      // Slower
      if (event.ctrlKey && event.key === ",") {
        isOnReplay.value ? slowerReplay() : undefined;
      }
      // Faster
      if (event.ctrlKey && event.key === ".") {
        isOnReplay.value ? fasterReplay() : undefined;
      }
    };
    document.addEventListener("keyup", replayKeyHandler);
    preventSpacebarPageScrollDown = (event: KeyboardEvent): void => {
      console.log("keydown");
      if (event.code === "Space" && event.target == document.body) {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", preventSpacebarPageScrollDown);
  };

  const removeKeyboardHandler = () => {
    document.removeEventListener("keyup", handleSpaceBarForReplay);
    document.removeEventListener("keydown", preventSpacebarPageScrollDown);
  };

  const replaySpeed = computed(() =>
    replayFactor.value >= 0
      ? REPLAY_FACTORS[replayFactor.value] * FLIGHT_FIXES_INTERVAL_S + "x"
      : "0"
  );

  return {
    isOnReplay,
    isStopped,
    isFollowReplay,
    replaySpeed,
    startReplay,
    pauseReplay,
    stopReplay,
    fasterReplay,
    slowerReplay,
    updateReplayPosition,
    followReplayOnMap,
    addKeyboardHandler,
    removeKeyboardHandler,
  };
};
