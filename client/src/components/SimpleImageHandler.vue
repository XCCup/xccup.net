<script setup lang="ts">
import { getbaseURL } from "@/helper/baseUrlHelper";

defineProps({
  logoId: {
    type: String,
    required: false,
    default: undefined,
  },
});

function onAddImage() {
  console.log("add image");
}

function onDeleteImage() {
  console.log("delete image");
}
</script>

<template>
  <div class="p-2 bg-light mb-4 p-4 sponsor-box filter position-relative">
    <img
      v-if="logoId"
      class="mw-100 mh-100 position-relative top-50 start-50 translate-middle"
      :src="getbaseURL() + `media/` + logoId"
    />
    <span
      v-if="logoId"
      class="shadow position-absolute translate-middle clickable badge rounded-pill bg-danger"
      style="top: 20px; right: -10px"
      @click.prevent="onDeleteImage"
    >
      <i class="bi bi-trash fs-6"></i>
    </span>
    <button
      class="btn block w-100 bi bi-plus-square fs-1 text-primary"
      @click.prevent="onAddImage"
    ></button>
  </div>
</template>
