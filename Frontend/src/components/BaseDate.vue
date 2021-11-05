<template>
  <span v-if="timestamp">{{ format(new Date(timestamp), dateFormat) }}</span>
</template>

<script setup>
import { format } from "date-fns";
const props = defineProps({
  timestamp: {
    type: [String, Number],
    required: true,
  },
  dateFormat: {
    type: String,
    default: "dd.MM.yyyy",
  },
});
</script>
