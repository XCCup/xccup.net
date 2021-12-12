<template v-if="rankingClass">
  <i
    class="bi bi-trophy"
    :class="rankingClass.key"
    data-bs-placement="top"
    :ref="icon"
    :title="rankingClass.description ?? rankingClass.shortDescription"
  ></i>
  {{ showDescription == true ? displayedDescription : "" }}
</template>

<script setup>
import { onMounted, computed, ref, onUnmounted } from "vue";
import { Tooltip } from "bootstrap";

const icon = ref();
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
  tooltip = new Tooltip(icon.value);
});

onUnmounted(() => {
  tooltip.dispose();
  tooltip = null;
});
</script>
