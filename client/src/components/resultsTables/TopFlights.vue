<template>
  <table v-if="flights" class="table table-hover">
    <tbody>
      <tr
        v-for="(flight, index) in flights.slice(0, 5)"
        :key="flight.id"
        :item="flight"
        :index="index"
        @click="routeToFlight(flight.externalId)"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td>
          <BaseDate :timestamp="flight.takeoffTime" date-format="dd.MM" />
        </td>
        <td>{{ flight.user.firstName + " " + flight.user.lastName }}</td>
        <td>{{ flight.takeoff.name }}</td>
        <td class="no-line-break">
          {{ Math.floor(flight.flightDistance) }} km
        </td>
        <td class="no-line-break">
          <FlightTypeIcon :flight-type="flight.flightType" />
          {{ flight.flightPoints }} P
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

defineProps({
  flights: {
    type: Array,
    required: true,
  },
});
const routeToFlight = (flightId) => {
  router.push({
    name: "Flight",
    params: {
      flightId: flightId,
    },
  });
};
</script>

<style scoped lang="scss">
tr:hover {
  cursor: pointer;
}
</style>
