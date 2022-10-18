<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";
import useData from "@/composables/useData";

interface RankingClasses {
  [key: string]: {
    description?: string;
    shortDescription?: string;
    gliderClasses?: string[];
  };
}

const route = useRoute();
const title = ref("Klassenwertung");

setWindowName(title.value);

const {
  initData,
  data: results,
  dataConstants,
  noDataFlag,
  filterDataBy,
} = useData();

let rankingClasses: RankingClasses | null = null;
const rankingClassDescriptions = ref<string[]>([]);
const selectedClass = ref<null | string>(null);

try {
  const res = await ApiService.getFilterOptions();
  if (res.data.rankingClasses) {
    rankingClasses = res.data.rankingClasses as RankingClasses;
    rankingClassDescriptions.value = Object.values(rankingClasses).map(
      (e) => e.shortDescription ?? ""
    );
    selectedClass.value = rankingClassDescriptions.value[1];
  } else {
    console.log("No ranking classes defined");
  }
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
  },
});

const onClassSelected = () => {
  filterDataBy({ rankingClass: findKeyOfRankingClass() });
};

const findKeyOfRankingClass = () => {
  if (!rankingClasses) return;
  for (const [key, value] of Object.entries(rankingClasses)) {
    if (value.shortDescription == selectedClass.value) return key;
  }
};
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
