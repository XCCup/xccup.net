<template>
  <div class="d-flex justify-content-center spinner-mod">
    <div class="spinner-border text-primary m-5" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Spinner",
};
</script>

<style scoped>
.spinner-mod {
  height: 80vh;
}
</style>
