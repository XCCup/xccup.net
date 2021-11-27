<template>
  <div class="row">
    <div class="col"><FlightTypeIcon :flight-type="flightType" /></div>
    <div class="col">
      <div v-if="flight">
        <router-link
          :to="{
            name: 'Flight',
            params: { flightId: flight.externalId },
          }"
        >
          {{ Math.round(flight.flightDistance) }} km ({{
            Math.round(flight.flightPoints)
          }}
          P)
        </router-link>
      </div>
      <div v-else>-</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  flight: {
    type: Object,
    default: null,
  },
  flightType: {
    type: String,
    required: true,
  },
});
</script>
