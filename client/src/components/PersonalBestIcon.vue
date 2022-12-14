<template>
  <span class="me-1"
    ><i
      ref="icon"
      class="bi bi-award text-warning"
      data-bs-placement="top"
      title="Neue Persönliche Bestleistung"
    ></i>
  </span>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Tooltip } from "bootstrap";

let tooltip: Tooltip | null = null;
const icon = ref(null);

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
