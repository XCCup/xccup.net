<template>
  <div class="container-fluid">
    <h3>Streckenmeldungen {{ year }}</h3>
  </div>
  <FlightsTable :flights="flights" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";

const props = defineProps({
  year: {
    type: [String, Number],
    required: true,
  },
});

setWindowName("Streckenmeldungen");

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
