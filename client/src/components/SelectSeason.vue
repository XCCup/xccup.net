<template>
  <select
    id="select-season"
    v-model="selectedSeason"
    class="form-select form-select-sm border-primary w-auto"
    @change="onSeasonSelected"
  >
    <option v-for="season in SEASONS" :key="season" :value="season">
      {{ season }}
    </option>
  </select>
</template>

<script setup>
import { SEASONS } from "../common/Constants";
import { useRouter, useRoute } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const route = useRoute();

const selectedSeason = ref(route.params.year);
const onSeasonSelected = () => {
  router.push({
    // I am so smart!
    name: route.name,
    params: {
      year: selectedSeason.value,
    },
  });
};
</script>
