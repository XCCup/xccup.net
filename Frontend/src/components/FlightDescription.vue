<template>
  <div class="container">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p>
        {{ description.description }}
      </p>
    </div>
    <div
      class="row mb-4"
      v-for="(image, index) in description.images"
      :key="index"
    >
      <div class="col-4">
        <figure class="figure">
          <a
            href="@/assets/images/rachtig.jpg"
            data-lightbox="images"
            data-title="Lorem, ipsum dolor."
            ><img
              src="@/assets/images/rachtig.jpg"
              class="figure-img img-fluid img-thumbnail"
              alt=""
          /></a>

          <figcaption class="figure-caption text-center">
            Lorem, ipsum dolor.
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
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
