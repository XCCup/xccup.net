<template>
  <div class="container py-2">
    <div v-html="marked(markdown)"></div>
  </div>
</template>
<script setup lang="ts">
import { marked } from "marked";
import markdown from "@/blog/airspace-info.md?raw";
</script>
