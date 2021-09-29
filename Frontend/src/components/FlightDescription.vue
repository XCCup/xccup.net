<template>
  <div class="container" v-if="description">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p>
        {{ description }}
      </p>
    </div>
    <div class="row mb-4">
      <div class="col-4" v-for="(image, index) in images" :key="index">
        <figure class="figure">
          <a
            :href="require('@/assets/images/' + image.file)"
            data-lightbox="images"
            data-title="Lorem, ipsum dolor."
            ><img
              :src="require('@/assets/images/' + image.file)"
              class="figure-img img-fluid img-thumbnail"
              alt=""
          /></a>

          <figcaption class="figure-caption text-center">
            {{ image.caption }}
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FlightDescription",
  props: {
    description: {
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
