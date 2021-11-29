<template>
  <div class="d-flex justify-content-center spinner-mod" :class="customClass">
    <div class="spinner-border text-primary m-2" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: "",
  },
});
</script>

<style scoped></style>
