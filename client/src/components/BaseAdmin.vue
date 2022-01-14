<template>
  <a :href="`mailto:${ADMIN_EMAIL}`">Administrator</a>
</template>

<script setup>
import { ADMIN_EMAIL } from "../common/Constants";
</script>
