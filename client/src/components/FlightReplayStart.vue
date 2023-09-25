<template>
  <button
    class="btn btn-primary leaflet-control col-auto"
    @click="startReplay"
    v-if="!isOnReplay && isStopped"
    @dblclick.stop
    title="Start (Strg + Leertaste)"
  >
    <i class="bi bi-play-fill"></i>
  </button>
</template>

<script setup lang="ts">
import useFlightReplay from "@/composables/useFlightReplay";

const { isOnReplay, isStopped, startReplay } = useFlightReplay();
</script>
