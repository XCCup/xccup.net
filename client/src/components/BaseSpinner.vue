<template>
  <!-- TODO: Optimize template -->
  <div
    v-if="fullsize"
    class="position-absolute top-50 start-50 translate-middle"
  >
    <div
      class="spinner-border text-primary"
      style="width: 5rem; height: 5rem"
      role="status"
      data-cy="base-spinner"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <span
    v-if="!fullsize"
    class="spinner-border spinner-border-sm"
    role="status"
    aria-hidden="true"
    data-cy="base-spinner"
  >
  </span>
  <span v-if="!fullsize" class="visually-hidden">Loading...</span>
</template>
<!-- TODO Only show spinner after 500ms -->

<script setup>
defineProps({
  fullsize: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
