<template>
  <i
    v-if="flightState === `In Wertung`"
    class="bi bi-check2 text-success"
    ref="icon"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Nicht in Wertung`"
    class="bi bi-x-circle text-danger"
    ref="icon"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Flugbuch`"
    class="bi bi-journal-text"
    ref="icon"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `In Bearbeitung`"
    class="bi bi-hourglass-split"
    ref="icon"
    data-bs-placement="top"
    :title="flightState"
  ></i>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { Tooltip } from "bootstrap";

const icon = ref(null);
let tooltip = null;

defineProps({
  flightState: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  tooltip = new Tooltip(icon.value);
});

onUnmounted(() => {
  if (tooltip) {
    tooltip.dispose();
    tooltip = null;
  }
});
</script>

<style scoped></style>
