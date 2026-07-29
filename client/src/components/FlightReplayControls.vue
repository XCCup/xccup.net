<template>
  <div class="row user-select-none">
    <button
      v-if="isOnReplay || (!isOnReplay && !isStopped)"
      class="btn btn-primary leaflet-control col-auto user-select-none"
      title="Start/Pause (Strg + Leertaste)"
      @click="isOnReplay ? pauseReplay() : startReplay()"
      @dblclick.stop
    >
      <i :class="isOnReplay ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
    </button>
    <select
      v-if="!isStopped"
      class="btn btn-primary dropdown-toggle leaflet-control col-auto user-select-none"
      title="Langsamer (Strg + ,) / Schneller (Strg + .)"
      @change="changeReplaySpeed($event)"
    >
      <option
        v-for="option in replayFactors"
        :key="option.value"
        class="dropdown-item user-select-none"
        :value="option.value"
        :selected="option.value === replayFactor"
      >
        {{ option.text }}
      </option>
    </select>
    <button
      v-if="isOnReplay || (!isOnReplay && !isStopped)"
      class="btn btn-primary leaflet-control col-auto user-select-none"
      title="Beende Wiedergabe"
      @click="stopReplay"
      @dblclick.stop
    >
      <i class="bi bi-stop-fill"></i>
    </button>
    <button
      v-if="isOnReplay || (!isOnReplay && !isStopped)"
      class="btn btn-primary leaflet-control col-auto user-select-none"
      title="Halte Position in Kartenmitte"
      @click="
        isFollowReplay ? followReplayOnMap(false) : followReplayOnMap(true)
      "
      @dblclick.stop
    >
      <i
        class="bi user-select-none"
        :class="isFollowReplay ? 'bi-eye-slash' : 'bi-eye'"
      ></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import useFlightReplay from "@/composables/useFlightReplay";

const {
  isOnReplay,
  isStopped,
  isFollowReplay,
  startReplay,
  pauseReplay,
  stopReplay,
  setReplayFactor,
  addKeyboardHandler,
  removeKeyboardHandler,
  followReplayOnMap,
  replayFactor,
  replayFactors,
} = useFlightReplay();

const changeReplaySpeed = (event: Event) => {
  // @ts-ignore
  setReplayFactor(event.target?.value);
};

onBeforeUnmount(() => {
  // Remove all click listener and terminate possible going replay
  removeKeyboardHandler();
  stopReplay();
});

addKeyboardHandler();
</script>
