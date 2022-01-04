<template>
  <span v-if="timestamp">{{ formatedDate }}</span>
</template>

<script setup>
import { formatInTimeZone } from "date-fns-tz";
import { computed } from "vue";
const props = defineProps({
  timestamp: {
    type: [String, Number, Date],
    required: true,
  },
  dateFormat: {
    type: String,
    default: "dd.MM.yyyy",
  },
});

const tz = import.meta.env.VITE_BASE_TZ || "Europe/Berlin";

const formatedDate = computed(() => {
  return formatInTimeZone(new Date(props.timestamp), tz, props.dateFormat);
});
</script>
