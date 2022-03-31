<template>
  <span v-if="rankingClass">
    <i
      ref="icon"
      class="bi bi-trophy"
      :class="rankingClass?.key"
      data-bs-placement="top"
      :title="rankingClass?.description ?? rankingClass?.shortDescription"
    ></i>
    {{ showDescription == true ? displayedDescription : "" }}
  </span>
</template>

<script setup>
import { onMounted, computed, ref, onUnmounted } from "vue";
import { Tooltip } from "bootstrap";

const icon = ref(null);
let tooltip = null;

const props = defineProps({
  rankingClass: {
    type: Object,
    required: true,
  },
  short: {
    type: Boolean,
    default: false,
  },
  showDescription: {
    type: Boolean,
    default: false,
  },
});
const displayedDescription = computed(() =>
  props.short
    ? props.rankingClass.shortDescription
    : props.rankingClass.description
);

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
