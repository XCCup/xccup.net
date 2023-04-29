<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="container py-2" v-html="marked(markdown)"></div>
</template>
<script setup lang="ts">
import { marked } from "marked";
import markdown from "@/blog/auto-upload-info.md?raw";
import { setWindowName } from "../helper/utils";

setWindowName("Automatisches Hochladen von Flügen");
</script>
