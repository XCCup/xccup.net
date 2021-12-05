<template>
  <div
    v-if="fullsize"
    class="position-absolute top-50 start-50 translate-middle"
  >
    <div
      class="spinner-border text-primary"
      style="width: 5rem; height: 5rem"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div v-else>
    <span
      class="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    >
    </span>
    <span class="visually-hidden">Loading...</span>
  </div>
</template>

<script setup>
defineProps({
  fullsize: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
