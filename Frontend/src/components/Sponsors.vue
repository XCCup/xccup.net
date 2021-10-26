<template>
  <!-- Divider -->
  <div class="bg-primary text-light p-4">
    <br />
  </div>

  <section>
    <div class="container mt-2">
      <h2>Sponsoren</h2>
      <div class="row">
        <div
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          class="col-4 col-sm-4 col-md-3 col-lg-2"
        >
          <div class="square-holder">
            <a :href="sponsor.website">
              <img
                :src="baseURL + `media/` + sponsor.Logo.id + `?thumb=true`"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "Sponsors",
  data() {
    return {
      baseURL: process.env.VUE_APP_API_URL,
    };
  },
  props: {
    sponsors: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
img {
  max-height: 55px;
}
.square-holder {
  padding: 15px;
  border: 1px solid #cecece;
  align-items: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #f1f1f1;
  min-height: 120px;
}

.square-holder img {
  max-width: 100%;
  filter: grayscale(100%);
  transition: all 0.3s;
}

.square-holder:hover img {
  filter: none;
}
</style>
