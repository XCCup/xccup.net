<template>
  <span v-if="timestamp">{{ formatedDate }}</span>
</template>

<script setup>
import { getXccupTimezone } from "@/helper/utils";
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

const formatedDate = computed(() => {
  return formatInTimeZone(
    new Date(props.timestamp),
    getXccupTimezone(),
    props.dateFormat
  );
});
</script>
