<template>
  <i
    v-if="flightState === `In Wertung`"
    class="bi bi-check2 text-success"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Nicht in Wertung`"
    class="bi bi-x-circle text-danger"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `Flugbuch`"
    class="bi bi-journal-text"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :title="flightState"
  ></i>
  <i
    v-if="flightState === `In Bearbeitung`"
    class="bi bi-hourglass-split"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :title="flightState"
  ></i>
</template>

<script setup>
import { onMounted } from "vue";
import { Tooltip } from "bootstrap";

defineProps({
  flightState: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  // Activate popper tooltips
  let tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    new Tooltip(tooltipTriggerEl);
  });
});
</script>

<style scoped></style>
