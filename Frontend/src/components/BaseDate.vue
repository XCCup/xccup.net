<template>
  <span v-if="timestamp">{{ format(new Date(timestamp), dateFormat) }}</span>
</template>

<script setup>
import { format } from "date-fns";
defineProps({
  timestamp: {
    type: [String, Number, Date],
    required: true,
  },
  dateFormat: {
    type: String,
    default: "dd.MM.yyyy",
  },
});
</script>
