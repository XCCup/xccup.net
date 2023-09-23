<template>
  <div class="row">
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="startReplay"
      v-if="!isOnReplay || isStopped"
      @dblclick.stop
      title="Start: Strg + Leertaste"
    >
      <i class="bi bi-play-fill"></i>
    </button>
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="pauseReplay"
      v-if="isOnReplay && !isStopped"
      @dblclick.stop
      title="Pause: Strg + Leertaste"
    >
      <i class="bi bi-pause-fill"></i>
    </button>
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="slowerReplay"
      @dblclick.stop
      v-if="!isStopped"
      title="Langsamer: Strg + ,"
    >
      <i class="bi bi-skip-backward-fill"></i>
    </button>
    <label
      class="btn btn-primary leaflet-control disabled col-auto"
      v-if="!isStopped"
    >
      {{ replaySpeed }}
    </label>
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="fasterReplay"
      @dblclick.stop
      v-if="!isStopped"
      title="Schneller: Strg + ."
    >
      <i class="bi bi-fast-forward-fill"></i>
    </button>
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="stopReplay"
      @dblclick.stop
      v-if="isOnReplay || (!isOnReplay && !isStopped)"
    >
      <i class="bi bi-stop-fill"></i>
    </button>
    <button
      class="btn btn-primary leaflet-control col-auto"
      @click="
        isFollowReplay ? followReplayOnMap(false) : followReplayOnMap(true)
      "
      @dblclick.stop
      v-if="isOnReplay || (!isOnReplay && !isStopped)"
    >
      <i class="bi" :class="isFollowReplay ? 'bi-eye-slash' : 'bi-eye'"></i>
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
  replaySpeed,
  startReplay,
  pauseReplay,
  fasterReplay,
  slowerReplay,
  stopReplay,
  addKeyboardHandler,
  removeKeyboardHandler,
  followReplayOnMap,
} = useFlightReplay();

onBeforeUnmount(() => {
  // Remove all click listener and terminate possible going replay
  removeKeyboardHandler();
  stopReplay();
});

addKeyboardHandler();
</script>
