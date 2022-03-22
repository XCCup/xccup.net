<template>
  <span>
    <i v-if="flight?.photos?.length" class="bi bi-camera me-1"></i>
    <i v-if="flight?.report" class="bi bi-card-text"></i>
  </span>
</template>

<script setup>
defineProps({
  flight: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
