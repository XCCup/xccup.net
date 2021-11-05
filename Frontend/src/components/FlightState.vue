<template>
  <i v-if="flightState === `In Wertung`" class="bi bi-check2 text-success"></i>
  <i
    v-if="flightState === `Nicht in Wertung`"
    class="bi bi-x-circle text-danger"
  ></i>
  <i v-if="flightState === `Flugbuch`" class="bi bi-journal-text"></i>
  <i v-if="flightState === `In Bearbeitung`" class="bi bi-hourglass-split"></i>

  <!-- <i class="bi bi-x-circle"></i> -->
  <!-- <i class="bi bi-exclamation-circle"></i> -->
  <!-- <i class="bi bi-exclamation-triangle"></i> -->
</template>

<script setup>
const props = defineProps({
  flightState: {
    type: String,
  },
});
</script>

<style></style>
