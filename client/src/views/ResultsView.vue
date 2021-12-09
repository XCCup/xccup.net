<template>
  <div class="container-fluid mb-3">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
    <p v-if="remark">Hinweis: {{ remark }}</p>
    <div v-if="category == 'overall'" class="row">
      <div class="col-6">
        <FlightsFilterPanel
          :is-loading="isLoading"
          :filter-active="filterActive"
          @clear-filter="clearFilter"
          @show-filter="showFilter"
        />
      </div>
    </div>
  </div>
  <ResultsTableGeneric
    :results="results.values"
    :max-flights="results.constants.NUMBER_OF_SCORED_FLIGHTS"
  />
  <ModalFilterResults
    :filter-active="filterActive"
    @filter-results="filterResults"
  />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, watchEffect, onMounted, computed } from "vue";
import {
  checkIfAnyValueOfObjectIsDefined,
  setWindowName,
} from "../helper/utils";
import { Modal } from "bootstrap";
import { useRoute } from "vue-router";

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
const results = ref(null);
const categories = [
  {
    name: "overall",
    title: "Gesamtwertung",
    apiString: "",
  },
  {
    name: "newcomer",
    title: "Newcomerwertung",
    apiString: "newcomer",
    remarks: () =>
      `Es werden nur Flüge mit Geräten bis zur Klasse ${results.value.constants.NEWCOMER_MAX_RANKING_CLASS} berücksichtigt`,
  },
  {
    name: "seniors",
    title: "Seniorenwertung",
    apiString: "seniors",
    remarks: () =>
      `Die Wertung beginnt ab einem Alter von ${results.value.constants.SENIOR_START_AGE} mit einem Bonus von ${results.value.constants.SENIOR_BONUS_PER_AGE}% pro Jahr`,
  },
  {
    name: "ladies",
    title: "Damenwertung",
    apiString: "?gender=W",
  },
  {
    name: "rlp-state",
    title: "Landesmeisterschaft RLP",
    apiString: "?state=RP",
    remarks: () =>
      `Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war`,
  },
  {
    name: "lux-state",
    title: "Luxemburg Championat",
    apiString: "?state=LUX",
    remarks: () =>
      `Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war`,
  },
];
const activeCategory = categories.find((e) => e.name === props.category);
// Name the window
watchEffect(() => {
  setWindowName(activeCategory.title);
});

const filterOptionsCache = ref(router.query);
const paramsCache = ref({ year: props.year });
const isLoading = ref(false);

const fetchResults = async () => {
  try {
    isLoading.value = true;
    if (!activeCategory) throw "not a valid category";
    const res = await ApiService.getResults(activeCategory.apiString, {
      ...paramsCache.value,
      ...filterOptionsCache.value,
    });
    if (res.status != 200) throw res.status.text;

    results.value = res.data;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
await fetchResults();
// Remark has an internal reference to results. Therefore the fetchResults function has to be run at least once before setting the remark value.
if (activeCategory.remarks) remark.value = activeCategory.remarks();

let filterModal;
onMounted(() => {
  filterModal = new Modal(document.getElementById("resultFilterModal"));
});

const filterActive = computed(() =>
  checkIfAnyValueOfObjectIsDefined(filterOptionsCache.value)
);

const showFilter = () => {
  filterModal.show();
};
const clearFilter = () => {
  filterOptionsCache.value = null;
  fetchResults();
};
const filterResults = (filterOptions) => {
  //Check if any filter value was set
  if (!Object.values(filterOptions).find((v) => !!v)) return;
  filterOptionsCache.value = filterOptions;
  fetchResults();
};
</script>
