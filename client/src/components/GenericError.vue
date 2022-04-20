<template>
  <div class="container mt-2">
    <h1>Uh-Oh!</h1>

    <h3>
      {{ GENERIC_ERROR }} <br />
      <a href="#" @click.prevent="$router.go(0)">Hier klicken</a> um es noch mal
      zu probieren
    </h3>
  </div>
</template>

<script setup lang="ts">
import { GENERIC_ERROR } from "@/common/Constants";
</script>

<style scoped></style>
