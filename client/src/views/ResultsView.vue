<template>
  <div class="container-lg">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
    <p v-if="remark">Hinweis: {{ remark }}</p>
    <div v-if="category == 'overall'" class="row">
      <div class="col-6">
        <FilterPanel
          :api-endpoint="ApiService.getResults"
          @show-filter="showFilter"
        />
      </div>
    </div>
    <ResultsTableGeneric
      :results="results?.values || []"
      :max-flights="results?.constants?.NUMBER_OF_SCORED_FLIGHTS || 0"
    />
    <ModalFilterResults />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, watchEffect, onMounted } from "vue";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import { useRoute } from "vue-router";
import useData from "../composables/useData";

const router = useRoute();

const props = defineProps({
  year: {
    type: [String, Number],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const remark = ref();
const categories = [
  {
    name: "overall",
    title: "Gesamtwertung",
    apiExtensionString: "",
  },
  {
    name: "newcomer",
    title: "Newcomerwertung",
    apiExtensionString: "newcomer",
    remarks: () =>
      `Es werden nur Flüge mit Geräten bis zur ${results.value.constants.NEWCOMER_MAX_RANKING_CLASS} berücksichtigt`,
  },
  {
    name: "seniors",
    title: "Seniorenwertung",
    apiExtensionString: "seniors",
    remarks: () =>
      `Die Wertung beginnt ab einem Alter von ${results.value.constants.SENIOR_START_AGE} mit einem Bonus von ${results.value.constants.SENIOR_BONUS_PER_AGE}% pro Jahr`,
  },
  {
    name: "ladies",
    title: "Damenwertung",
    apiExtensionString: "?gender=W",
  },
  {
    name: "rlp-state",
    title: "Landesmeisterschaft RLP",
    apiExtensionString: "?state=RP",
    remarks: () =>
      `Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war`,
  },
  {
    name: "lux-state",
    title: "Luxemburg Championat",
    apiExtensionString: "?state=LUX",
    remarks: () =>
      `Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war`,
  },
];
const activeCategory = categories.find((e) => e.name === props.category);

const { fetchData, data: results } = useData(
  ApiService.getResults,
  activeCategory.apiExtensionString
);

// Name the window
watchEffect(() => {
  setWindowName(activeCategory.title);
});

await fetchData({
  params: { year: props.year },
  queries: router.query,
});
// Remark has an internal reference to results. Therefore the fetchData function has to be run at least once before setting the remark value.
if (activeCategory.remarks) remark.value = activeCategory.remarks();

let filterModal;
onMounted(() => {
  filterModal = new Modal(document.getElementById("resultFilterModal"));
});

const showFilter = () => {
  filterModal.show();
};
</script>
