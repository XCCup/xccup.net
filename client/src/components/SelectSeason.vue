<template>
  <select
    id="select-season"
    v-model="selectedSeason"
    class="form-select form-select-sm border-primary w-auto"
    @change="onSeasonSelected"
  >
    <option v-if="allowAllSeasons" value="">Alle</option>
    <option v-for="season in SEASONS" :key="season" :value="season">
      {{ season }}
    </option>
  </select>
</template>

<script lang="ts" setup>
import { SEASONS } from "../common/Constants";
import { useRoute } from "vue-router";
import { ref } from "vue";
import useData from "../composables/useData";

defineProps({
  allowAllSeasons: {
    type: Boolean,
    default: false,
  },
});

const { selectSeason } = useData();
const route = useRoute();

const yearParam = route.params.year ?? "";
const selectedSeason = ref(yearParam);

const onSeasonSelected = () => {
  selectSeason(selectedSeason.value);
};
</script>
