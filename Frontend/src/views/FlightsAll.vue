<template>
  <div class="container-fluid">
    <h3>Streckenmeldungen {{ year }}</h3>
  </div>
  <FlightsTable :flights="flights" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";

const props = defineProps({
  year: {
    type: [String, Number],
    default: 2021,
  },
});

// Name the window
document.title = `${import.meta.env.VITE_PAGE_TITLE_PREFIX}Streckenmeldungen`;

const flights = ref(null);
try {
  const { data: initialData } = await ApiService.getFlights({
    year: props.year,
  });
  flights.value = initialData;
} catch (error) {
  console.log(error);
}
</script>
