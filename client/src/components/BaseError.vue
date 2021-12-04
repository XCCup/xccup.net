<template>
  <div v-if="errorMessage" class="text-danger">
    {{ errorMessage }}
  </div>
</template>

<script setup>
defineProps({
  errorMessage: {
    type: [String, null],
    required: true,
  },
});
</script>
