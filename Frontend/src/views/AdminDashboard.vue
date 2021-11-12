<template>
  <div class="container-fluid">
    <h3>Kommandozentrale</h3>
  </div>
  <AdminFlights />
  <AdminNews />
</template>

<script setup>
// Name the window
document.title = `${import.meta.env.VITE_PAGE_TITLE_PREFIX}Admin`;
</script>

<style></style>
