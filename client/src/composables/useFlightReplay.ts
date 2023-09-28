import { readonly, ref } from "vue";
import useChartMouseOver from "./useChartMouseOver";
import useFlight from "./useFlight";

const { flight } = useFlight();

const { simulateMouseOver } = useChartMouseOver();

const REPLAY_FACTORS = [1, 2, 5, 10, 20, 50, 100];
const INTERVAL_MS = 1000;
const FLIGHT_FIXES_INTERVAL_S = 5;

let timer: ReturnType<typeof setInterval>;
let handleSpaceBarForReplay: (event: KeyboardEvent) => void;
let preventSpaceBarPageScrollDown: (event: KeyboardEvent) => void;

const replayFactor = ref(0);
const isStopped = ref(true);
const isOnReplay = ref(false);
const isFollowReplay = ref(false);
const replayFactors = ref(
  REPLAY_FACTORS.map((e) => {
    return {
      text: e * FLIGHT_FIXES_INTERVAL_S + "x",
      value: REPLAY_FACTORS.indexOf(e),
    };
  })
);

let position = 0;

function resetReplay() {
  clearInterval(timer);
  isOnReplay.value = false;
  position = 0;
}

function resetTimer() {
  clearInterval(timer);

  if (!isOnReplay.value) return;

  timer = setInterval(() => {
    position += 1;

    if (position == flight.value?.fixes?.length) {
      resetReplay();
    }

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
    resetTimer();
  };

  const pauseReplay = () => {
    isOnReplay.value = false;
    clearInterval(timer);
  };

  const fasterReplay = () => {
    if (replayFactor.value < REPLAY_FACTORS.length - 1) {
      replayFactor.value = replayFactor.value + 1;
      resetTimer();
    }
  };

  const slowerReplay = () => {
    if (replayFactor.value > 0) {
      replayFactor.value = replayFactor.value - 1;
      resetTimer();
    }
  };

  const setReplayFactor = (factor: number) => {
    replayFactor.value = factor;
    resetTimer();
  };

  const stopReplay = () => {
    clearInterval(timer);
    isStopped.value = true;
    isOnReplay.value = false;
    position = 0;
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
    preventSpaceBarPageScrollDown = (event: KeyboardEvent): void => {
      if (event.code === "Space" && event.target == document.body) {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", preventSpaceBarPageScrollDown);
  };

  const removeKeyboardHandler = () => {
    document.removeEventListener("keyup", handleSpaceBarForReplay);
    document.removeEventListener("keydown", preventSpaceBarPageScrollDown);
  };

  return {
    isOnReplay: readonly(isOnReplay),
    isStopped: readonly(isStopped),
    isFollowReplay: readonly(isFollowReplay),
    replayFactor: readonly(replayFactor),
    replayFactors: readonly(replayFactors),
    startReplay,
    pauseReplay,
    stopReplay,
    fasterReplay,
    slowerReplay,
    setReplayFactor,
    updateReplayPosition,
    followReplayOnMap,
    addKeyboardHandler,
    removeKeyboardHandler,
  };
};
