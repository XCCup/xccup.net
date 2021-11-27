<template>
  <div class="container-fluid">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
    <p v-if="remark">Hinweis: {{ remark }}</p>
  </div>
  <ResultsTable
    :results="results.values"
    :max-flights="results.constants.NUMBER_OF_SCORED_FLIGHTS"
  />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, watchEffect } from "vue";
import { setWindowName } from "../helper/utils";
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
const results = ref(null);
const remark = ref();

// Name the window
watchEffect(() => {
  setWindowName(activeCategory.title);
});

try {
  if (!activeCategory) throw "not a valid category";
  const res = await ApiService.getResults(activeCategory.apiString, {
    year: props.year,
  });
  if (res.status != 200) throw res.status.text;

  results.value = res.data;
  if (activeCategory.remarks) remark.value = activeCategory.remarks();
} catch (error) {
  console.log(error);
}
</script>
