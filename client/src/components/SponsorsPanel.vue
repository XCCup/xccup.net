<template v-if="sponsors">
  <div class="bg-primary text-light py-4">
    <div id="sponsorsPanel" class="container-md">
      <h2>Sponsoren</h2>
      <div
        id="goldSponsors"
        class="row row-cols-3 row-cols-md-3 row-cols-lg-3 row-cols-xl-3"
      >
        <div
          v-for="sponsor in goldSponsors"
          :key="sponsor.id"
          class="col cy-sponsor"
        >
          <a :href="sponsor.website" target="_blank">
            <div class="p-2 mb-4 p-4 sponsor-container filter">
              <img
                class="mw-100 mh-100 position-relative top-50 start-50 translate-middle"
                :src="baseURL + `media/` + sponsor.logo.id + `?size=thumb`"
              />
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="container-md mt-3">
    <div
      id="otherSponsors"
      class="row row-cols-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6"
    >
      <div
        v-for="sponsor in regularSponsors"
        :key="sponsor.id"
        class="col cy-sponsor"
      >
        <a :href="sponsor.website" target="_blank">
          <div class="p-2 mb-4 p-4 sponsor-container filter">
            <img
              class="mw-100 mh-100 position-relative top-50 start-50 translate-middle"
              :src="baseURL + `media/` + sponsor.logo.id + `?size=thumb`"
            />
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { shuffle } from "lodash-es";
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
  return shuffle(
    props.sponsors.filter(
      (sponsor) => sponsor.isGoldSponsor && sponsor.logo?.id != undefined
    )
  );
});

const regularSponsors = computed(() => {
  return shuffle(
    props.sponsors.filter(
      (sponsor) => !sponsor.isGoldSponsor && sponsor.logo?.id != undefined
    )
  );
});
</script>

<style lang="scss" scoped>
.filter {
  filter: grayscale(100%);
  transition: all 0.3s;
}

.filter:hover {
  filter: none;
}

.sponsor-container {
  border: 1px solid $gray-400;
  height: 120px;
  background-color: $light;
  @include color-scheme(dark) {
    border: 1px solid $gray-800;
    background-color: shade-color($light, 30%);
  }
}
.sponsor-container:hover {
  border: 1px solid $primary;
}
</style>
