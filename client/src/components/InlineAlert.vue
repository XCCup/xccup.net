<template>
  <div class="container mt-2">
    <i class="bi bi-exclamation-triangle"></i> {{ text }}
    <i class="bi bi-exclamation-triangle"></i>
    <br />
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<style scoped></style>
