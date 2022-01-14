<template>
  <h1>Uh-Oh!</h1>

  <h3>
    {{ GENERIC_ERROR }} <br />
    <a href="#" @click="$router.go(0)">Hier klicken</a> um es noch mal zu
    probieren
  </h3>
</template>

<script setup>
import { GENERIC_ERROR } from "@/common/Constants";
</script>

<style scoped></style>
