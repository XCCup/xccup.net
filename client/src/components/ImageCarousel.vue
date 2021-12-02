<template>
  <div
    id="carouselExampleInterval"
    class="carousel slide"
    data-bs-ride="carousel"
  >
    <div class="carousel-inner">
      <div
        v-for="(photo, index) in photos"
        :key="photo"
        class="carousel-item"
        :class="index === 0 ? 'active' : ''"
      >
        <img :src="photo" class="d-block w-100" alt="..." />
      </div>
    </div>
    <button
      class="carousel-control-prev"
      type="button"
      data-bs-target="#carouselExampleInterval"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      class="carousel-control-next"
      type="button"
      data-bs-target="#carouselExampleInterval"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import useFlight from "@/composables/useFlight";
import ApiService from "@/services/ApiService";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";
import router from "../router";

const photos = ref([
  "/src/assets/images/bremm.jpg",
  "/src/assets/images/rachtig.jpg",
]);
</script>

<style scoped></style>
