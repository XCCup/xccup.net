<template>
  <div v-if="timestamp">{{ format(new Date(timestamp), dateFormat) }}</div>
</template>

<script>
import { format } from "date-fns";
export default {
  name: "BaseDate",
  data() {
    return {
      format,
    };
  },
  props: {
    timestamp: {
      type: [String, Number],
      required: true,
    },
    dateFormat: {
      type: String,
      default: "dd.MM.yyyy",
    },
  },
};
</script>
