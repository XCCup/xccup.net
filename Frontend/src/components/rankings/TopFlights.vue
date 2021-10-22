<template>
  <table v-if="flights" class="table table-hover">
    <thead>
      <tr></tr>
    </thead>
    <tbody>
      <tr
        v-for="(flight, index) in flights.slice(0, 5)"
        v-bind:item="flight"
        v-bind:index="index"
        v-bind:key="flight.id"
        @click="routeToFlight(flight.externalId)"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td>
          <BaseDate :timestamp="flight.dateOfFlight" dateFormat="dd.MM" />
        </td>
        <td>{{ flight.User.firstName + " " + flight.User.lastName }}</td>
        <td>{{ flight.takeoff.name }}</td>
        <td>{{ Math.floor(flight.flightDistance) }} km</td>
        <td>{{ flight.flightType }}</td>
        <td>{{ flight.flightPoints }} P</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "TopFlights",
  components: {},

  props: {
    flights: {
      type: Array,
      required: true,
    },
  },
  methods: {
    routeToFlight(flightId) {
      this.$router.push({
        name: "Flight",
        params: {
          flightId: flightId,
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
tr:hover {
  cursor: pointer;
}
</style>
