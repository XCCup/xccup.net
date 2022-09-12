<template>
  <span v-if="rankingClass">
    <i
      ref="icon"
      :class="cssClasses"
      data-bs-placement="top"
      :title="rankingClass?.description ?? rankingClass?.shortDescription"
    ></i>
    {{ showDescription == true ? displayedDescription : "" }}
  </span>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from "vue";
import { Tooltip } from "bootstrap";

const icon = ref(null);
let tooltip: Tooltip | null = null;

const props = defineProps<{
  rankingClass?: {
    key?: string;
    shortDescription?: string;
    description?: string;
  };
  short?: Boolean;
  showDescription?: Boolean;
}>();

const displayedDescription = computed(() =>
  props.short
    ? props.rankingClass?.shortDescription
    : props.rankingClass?.description
);

const cssClasses = computed(() => {
  if (props.rankingClass?.key?.toLowerCase().includes("hg")) {
    return "bi bi-trophy-fill " + props.rankingClass?.key;
  }
  return "bi bi-trophy " + props.rankingClass?.key;
});

onMounted(() => {
  // Activate popper tooltips
  if (props.showDescription) return;
  if (icon.value) tooltip = new Tooltip(icon.value);
});

onUnmounted(() => {
  if (tooltip) {
    tooltip.dispose();
    tooltip = null;
  }
});
</script>
