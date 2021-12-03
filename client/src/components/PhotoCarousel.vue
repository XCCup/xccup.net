<template>
  <div class="container-lg">
    <div
      id="photo-carousel"
      class="carousel slide mt-4"
      data-bs-ride="carousel"
    >
      <div class="carousel-inner">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="carousel-item"
          :class="index === 0 ? 'active' : ''"
        >
          <img
            :src="baseURL + `media/` + photo.id"
            class="d-block w-100 carousel"
            alt="..."
          />
          <div class="carousel-caption">
            <span class="badge bg-light p-2" style="--bs-bg-opacity: 0.7">
              <router-link
                :to="{
                  name: 'Flight',
                  params: { flightId: photo.id },
                }"
              >
                {{ photo.description }}
              </router-link>
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
        <!-- TODO: Hover not working -->
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
  </div>
</template>

<script setup>
import { getbaseURL } from "@/helper/baseUrlHelper";

const baseURL = getbaseURL();
defineProps({
  photos: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
/* Styling is in App.vue */
</style>
