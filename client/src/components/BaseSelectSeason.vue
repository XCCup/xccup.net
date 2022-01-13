<template>
  <select
    id="select-year"
    v-model="selectedSeason"
    class="form-select form-select-sm border-primary w-auto"
    @change="onYearSelected"
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
const onYearSelected = () => {
  router.push({
    name: route.name,
    params: {
      year: selectedSeason.value,
    },
  });
};
</script>
