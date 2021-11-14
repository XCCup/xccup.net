<template v-if="rankingClass">
  <i
    class="bi bi-trophy"
    :class="rankingClass.key"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :title="rankingClass.description ?? rankingClass.shortDescription"
  ></i>
  {{ showDescription == true ? displayedDescription : "" }}
</template>

<script setup>
import { onMounted, computed } from "vue";
import { Tooltip } from "bootstrap";

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
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    new Tooltip(tooltipTriggerEl);
  });
});
</script>
