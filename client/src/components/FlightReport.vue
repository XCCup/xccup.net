<template>
  <div class="container">
    <div
      v-if="flight.airspaceComment"
      class="row mt-4"
      data-cy="airspace-comment"
    >
      <h4>Luftraumkommentar</h4>
      <p class="allow-white-spaces">
        {{ flight.airspaceComment }}
      </p>
    </div>
    <div v-if="flight.report" class="row mt-4" data-cy="flight-report">
      <h3>Flugbericht</h3>
      <p class="allow-white-spaces">
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
