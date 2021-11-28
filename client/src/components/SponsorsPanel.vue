<template>
  <!-- Divider -->
  <!-- <div class="bg-primary text-light p-4">
    <br />
  </div> -->

  <section v-if="sponsors">
    <div class="bg-primary text-light p-4">
      <div id="sponsorsPanel" class="container">
        <h2>Sponsoren</h2>
        <div id="goldSponsors" class="row mt-3">
          <div v-for="sponsor in goldSponsors" :key="sponsor.id" class="col">
            <div class="square-holder">
              <a :href="sponsor.website" target="_blank">
                <img
                  :src="baseURL + `media/` + sponsor.logo.id + `?thumb=true`"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-3">
      <div id="otherSponsors" class="row mt-3">
        <div
          v-for="sponsor in regularSponsors"
          :key="sponsor.id"
          class="col-3 col-sm-3 col-md-3 col-lg-2"
        >
          <div class="square-holder">
            <a :href="sponsor.website" target="_blank">
              <img
                :src="baseURL + `media/` + sponsor.logo.id + `?thumb=true`"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { shuffle } from "lodash";
import { computed } from "vue";

import { getbaseURL } from "@/helper/baseUrlHelper";

const baseURL = getbaseURL();
const props = defineProps({
  sponsors: {
    type: Array,
    required: true,
  },
});

const goldSponsors = computed(() => {
  return shuffle(props.sponsors.filter((sponsor) => sponsor.isGoldSponsor));
});

const regularSponsors = computed(() => {
  return shuffle(props.sponsors.filter((sponsor) => !sponsor.isGoldSponsor));
});
</script>

<style scoped>
img {
  max-height: 60px;
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
.square-holder:hover {
  border-color: #08556d;
}
</style>
