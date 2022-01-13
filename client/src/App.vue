<template>
  <!-- <TheNavbar /> -->
  <main class="container m-4">Die Beta-Phase startet am 15. Januar</main>
  <!-- <TheFooter /> -->
</template>

<script setup>
import { ref, onErrorCaptured } from "vue";

const error = ref(null);
onErrorCaptured((e) => {
  error.value = e;
  console.log(e);
  return true;
});
</script>

<style lang="scss">
@import "@/styles/style";
</style>
