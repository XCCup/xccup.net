<template>
  <div v-if="report" class="container">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p>
        {{ report }}
      </p>
    </div>
    <div v-if="photos" class="row mb-4">
      <div class="col-4" v-for="(photo, index) in photos" :key="index">
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

<script>
export default {
  name: "FlightReport",
  data() {
    return {
      baseURL: process.env.VUE_APP_API_URL,
    };
  },
  props: {
    report: {
      type: String,
      required: false,
    },
    photos: {
      type: Array,
      required: false,
    },
  },
};
</script>

<style scoped></style>
