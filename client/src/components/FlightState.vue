<template>
  <i
    v-if="flightState === `In Wertung`"
    ref="icon"
    class="bi bi-check2 text-success"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Nicht in Wertung`"
    ref="icon"
    class="bi bi-x-circle text-danger"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Flugbuch`"
    ref="icon"
    class="bi bi-journal-text"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `In Bearbeitung`"
    ref="icon"
    class="bi bi-hourglass-split"
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
  airspaceViolation: {
    type: Boolean,
    required: true,
  },
});

onMounted(() => {
  if (icon.value) tooltip = new Tooltip(icon.value);
});

onUnmounted(() => {
  if (tooltip) {
    tooltip.dispose();
    tooltip = null;
  }
});
</script>

<style scoped></style>
