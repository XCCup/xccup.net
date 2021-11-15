<template>
  <div class="container-fluid">
    <h3>Streckenmeldungen {{ year }}</h3>
  </div>
  <FlightsTable :flights="flights" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { setWindowName } from "../helper/utils";

const route = useRoute();

defineProps({
  year: {
    type: [String, Number],
    required: true,
  },
});

setWindowName("Streckenmeldungen");

const flights = ref(null);
try {
  const { data: initialData } = await ApiService.getFlights({
    ...route.params,
  });
  flights.value = initialData;
} catch (error) {
  console.log(error);
}
</script>
