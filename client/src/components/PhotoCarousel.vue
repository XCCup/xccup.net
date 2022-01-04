<template>
  <div v-if="photos.length" class="container-md my-3">
    <h3>Bilder der aktuellen Saison</h3>
    <div
      id="photo-carousel"
      class="carousel slide my-4"
      data-bs-ride="carousel"
    >
      <!-- Photo -->
      <div class="carousel-inner overflow-hidden ratio ratio-16x9">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="carousel-item"
          :class="index === 0 ? 'active' : ''"
        >
          <!-- TODO: Serve viewport dependent image size to save data on mobiles -->
          <img
            :src="baseURL + `media/` + photo.id"
            class="d-block w-100 carousel"
            :alt="photo.description"
          />
          <!-- Caption -->
          <div class="carousel-caption mb-0">
            <span class="badge bg-light text-dark p-2">
              <div class="mb-2 d-none d-md-block">
                {{ photo.description }}
              </div>

              <router-link
                :to="{
                  name: 'Flight',
                  params: { flightId: photo.flight.externalId },
                }"
              >
                <i class="bi bi-person-fill"></i>
                {{ photo.user.firstName + " " + photo.user.lastName }}
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

<style lang="scss" scoped>
$carousel-caption-padding-y: 0.5rem;
@import "@/styles/style";

img {
  height: 100%;
  object-fit: cover;
}
</style>
