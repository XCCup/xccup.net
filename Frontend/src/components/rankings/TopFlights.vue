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
        v-bind:key="flight._id"
        @click="routeToFlight(flight.flightId)"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td><BaseDate :timestamp="flight.date" dateFormat="dd.MM" /></td>
        <td>{{ flight.pilot }}</td>
        <td>{{ flight.takeoff }}</td>
        <td>{{ flight.distance }} km</td>
        <td>{{ flight.taskType }}</td>
        <td>{{ flight.points }} P</td>
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
