<template>
  <div class="container-fluid">
    <h3>Kommandozentrale</h3>
  </div>
  <AdminFlights />
  <AdminNews />
</template>

<script setup>
import { setWindowName } from "../helper/utils";
setWindowName("Admin");
</script>

<style scoped></style>
