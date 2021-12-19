<template>
  <div class="container">
    <div
      v-if="flight.airspaceReport"
      class="row mt-4"
      data-cy="airspace-comment"
    >
      <h4>Luftraumkommentar</h4>
      <p>
        {{ flight.airspaceReport }}
      </p>
    </div>
    <div v-if="flight.report" class="row mt-4">
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
