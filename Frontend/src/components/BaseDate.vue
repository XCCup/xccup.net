<template>
  {{ format(new Date(timestamp), dateFormat) }}
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
      type: [String],
      required: true,
    },
    dateFormat: {
      type: String,
      default: "dd.MM.yyyy",
    },
  },
};
</script>
