<template>
  <div class="container-fluid">
    <h3 v-if="activeCategory">{{ activeCategory.title }} {{ year }}</h3>
  </div>
  <div class="container-fluid">
    <p v-if="activeCategory.remarks">Hinweis: {{ activeCategory.remarks }}</p>
  </div>
  <ResultsTable :results="results" />
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
    remarks: "Es werden nur Flüge mit Geräten bis zur Klasse $NEWCOMER_MAX_RANKING_CLASS$ berücksichtigt"
  },
  {
    name: "seniors",
    title: "Seniorenwertung",
    apiString: "seniors",
  },
  {
    name: "ladies",
    title: "Damenwertung",
    apiString: "?gender=W",
  },
];
const activeCategory = categories.find((e) => e.name === props.category);
const results = ref(null);

try {
  if (!activeCategory) throw "not a valid category";
  const res = await ApiService.getResults(activeCategory.apiString, {
    year: props.year,
  });
  if (res.status != 200) throw res.status.text;

  results.value = res.data;

  replacePossiblePlaceholdersInRemarks(res);
} catch (error) {
  // results.value = [];
  console.log(error);
}

function replacePossiblePlaceholdersInRemarks(res) {
  if(activeCategory.remarks) {
    const matchingGroups=activeCategory.remarks.match(/\$(\w+)\$/g);
    for(let index=0;index<matchingGroups.length;index++) {
      const key = matchingGroups[index].replaceAll("$","")
      activeCategory.remarks=activeCategory.remarks.replace(matchingGroups[index], res.data.constants[key]);
    }
  }
}
</script>
