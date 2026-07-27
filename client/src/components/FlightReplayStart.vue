<template>
  <button
    v-if="!isOnReplay && isStopped"
    class="btn btn-primary leaflet-control col-auto"
    title="Start (Strg + Leertaste)"
    @click="startReplay"
    @dblclick.stop
  >
    <i class="bi bi-play-fill"></i>
  </button>
</template>

<script setup lang="ts">
import useFlightReplay from "@/composables/useFlightReplay";

const { isOnReplay, isStopped, startReplay } = useFlightReplay();
</script>
