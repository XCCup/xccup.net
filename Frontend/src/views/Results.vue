<template>
  <div class="container-fluid">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
    <p v-if="remark">Hinweis: {{ remark }}</p>
  </div>
  <ResultsTable
    :results="results.values"
    :maxFlights="results.constants.NUMBER_OF_SCORED_FLIGHTS"
  />
</template>

<script setup async>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
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
];
const activeCategory = categories.find((e) => e.name === props.category);
const results = ref(null);
const remark = ref();
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
