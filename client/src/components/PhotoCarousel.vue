<template>
  <div id="photo-carousel" class="carousel slide mt-4" data-bs-ride="carousel">
    <div class="carousel-inner">
      <div
        v-for="(photo, index) in photos"
        :key="photo"
        class="carousel-item"
        :class="index === 0 ? 'active' : ''"
      >
        <img :src="photo" class="d-block w-100" alt="..." />
        <div class="carousel-caption d-none d-md-block">
          <span class="badge bg-light p-2" style="--bs-bg-opacity: 0.5">
            Caption: {{ photo }}
          </span>
        </div>
      </div>
    </div>
    <button
      class="carousel-control-prev"
      type="button"
      data-bs-target="#photo-carousel"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      class="carousel-control-next"
      type="button"
      data-bs-target="#photo-carousel"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const photos = ref([
  "/src/assets/images/bremm.jpg",
  "/src/assets/images/rachtig.jpg",
]);
</script>

<style scoped>
img {
  height: 80vh;
  object-fit: cover;
}
</style>
