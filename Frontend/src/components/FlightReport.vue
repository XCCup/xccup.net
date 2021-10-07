<template>
  <div v-if="report" class="container">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p>
        {{ report }}
      </p>
    </div>
    <div v-if="images" class="row mb-4">
      <div class="col-4" v-for="(image, index) in images" :key="index">
        <figure class="figure">
          <a
            :href="baseURL + `media/` + image.id"
            data-lightbox="images"
            :data-title="
              image.description ? image.description : image.originalname
            "
            ><img
              :src="baseURL + `media/` + image.id"
              class="figure-img img-fluid img-thumbnail"
              alt=""
          /></a>

          <figcaption class="figure-caption text-center">
            {{ image.description ? image.description : image.originalname }}
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
      required: true,
    },
    images: {
      type: Array,
      required: false,
    },
  },
};
</script>

<style scoped></style>
