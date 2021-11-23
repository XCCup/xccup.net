<template>
  <div class="container-fluid">
    <h3>Streckenmeldungen {{ computedYear }}</h3>
  </div>
  <FlightsTable :flights="flights" @table-sort-changed="handleSortChange" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { setWindowName } from "../helper/utils";

const route = useRoute();

const props = defineProps({
  year: {
    type: [String, Number],
    default: "",
  },
});

const computedYear = computed(() => (props.year.length ? props.year : ""));

setWindowName("Streckenmeldungen");

const flights = ref(null);
await retrieveFlights();

const handleSortChange = (value) => {
  console.log("FlightsAll: ", value);
  retrieveFlights(value);
};

async function retrieveFlights(sortObject) {
  try {
    const { data: initialData } = await ApiService.getFlights({
      ...route.params,
      sortCol: sortObject?.sortCol,
      sortOrder: sortObject?.sortOrder,
    });
    flights.value = initialData;
  } catch (error) {
    console.log(error);
  }
}
</script>
