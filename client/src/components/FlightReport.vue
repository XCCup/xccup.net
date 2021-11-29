<template>
  <div v-if="flight.report || flight.photos" class="container">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p>
        {{ flight.report }}
      </p>
    </div>
    <div v-if="flight.photos" class="row mb-4">
      <div v-for="(photo, index) in flight.photos" :key="index" class="col-4">
        <figure class="figure">
          <a
            :href="baseURL + `media/` + photo.id"
            data-lightbox="images"
            :data-title="photo.description ? photo.description : ``"
          >
            <img
              :src="baseURL + `media/` + photo.id + `?thumb=true`"
              class="figure-img img-fluid img-thumbnail"
              alt=""
          /></a>

          <figcaption class="figure-caption text-center">
            {{ photo.description ? photo.description : "" }}
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
const { flight } = useFlight();

import { getbaseURL } from "@/helper/baseUrlHelper";

const baseURL = getbaseURL();
</script>

<style scoped></style>
