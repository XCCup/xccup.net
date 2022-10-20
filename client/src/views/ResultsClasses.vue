<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "@/composables/useData";
import useFilterOptions from "@/composables/useFilterOptions";
import type { RankingClasses } from "@/types/FilterOptions";

const route = useRoute();
const title = ref("Klassenwertung");

setWindowName(title.value);

const {
  initData,
  data: results,
  dataConstants,
  noDataFlag,
  filterDataBy,
  activeFilters,
} = useData();

let rankingClasses: RankingClasses;
const rankingClassDescriptions = ref<string[]>([]);
const selectedClass = ref<null | string>(null);

try {
  rankingClasses =
    (await useFilterOptions().getFilterOptions()).value?.rankingClasses ?? {};
  createRankingClassOptions();
} catch (error) {
  console.log(error);
}

// Prevent to send a request query with an empty year parameter
const params = route.params.year ? route.params : undefined;

// Await is necessary to trigger the suspense feature
await initData(ApiService.getResultsOverall, {
  queryParameters: {
    ...route.query,
    ...params,
    rankingClass: findKeyOfRankingClass(),
  },
});

const onClassSelected = () => {
  filterDataBy({ rankingClass: findKeyOfRankingClass() });
};

function createRankingClassOptions() {
  rankingClassDescriptions.value = Object.values(rankingClasses).map(
    (e) => e.shortDescription ?? ""
  );
  selectedClass.value = determineSelectedClass();
}

function findKeyOfRankingClass() {
  if (!rankingClasses) return;

  for (const [key, value] of Object.entries(rankingClasses)) {
    if (value.shortDescription == selectedClass.value) return key;
  }
}

function determineSelectedClass(): string {
  const rankingKey = activeFilters.value.rankingClass;
  if (
    rankingKey &&
    rankingClasses &&
    rankingClasses[rankingKey].shortDescription
  ) {
    return (
      rankingClasses[rankingKey].shortDescription ??
      rankingClassDescriptions.value[1]
    );
  }
  return rankingClassDescriptions.value[1];
}
</script>

<!-- Necessary for <keep-alive> -->
<script lang="ts">
export default {
  name: "ResultsClasses",
  inheritAttrs: false,
  customOptions: {},
};
</script>

<template>
  <div class="container-lg">
    <h3 v-once>{{ title }} {{ route.params?.year }}</h3>

    <div v-if="results">
      <div class="d-flex mb-4">
        <div class="my-1 me-2"><SelectSeason /></div>
        <div class="my-1">
          <select
            id="select-season"
            v-model="selectedClass"
            class="form-select form-select-sm border-primary w-auto"
            @change="onClassSelected"
          >
            <option
              v-for="className in rankingClassDescriptions"
              :key="className"
              :value="className"
            >
              {{ className }}
            </option>
          </select>
        </div>
      </div>

      <ResultsTableGeneric
        :results="results"
        :no-data-flag="noDataFlag"
        :max-flights="dataConstants?.NUMBER_OF_SCORED_FLIGHTS ?? 0"
      />
    </div>
    <GenericError v-else />
  </div>
</template>
