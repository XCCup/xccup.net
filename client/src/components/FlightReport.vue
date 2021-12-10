<template>
  <div v-if="flight.report" class="container">
    <div class="row mt-4">
      <h3>Flugbericht</h3>
      <p id="flightReport">
        {{ flight.report }}
      </p>
    </div>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
const { flight } = useFlight();
</script>

<style scoped></style>
