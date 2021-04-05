<template>
  <table class="table table-hover">
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
        <td>{{ flight.date }}</td>
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
import FlightService from "@/services/FlightService";
export default {
  name: "TopFluege",
  components: {},
  data() {
    return {
      flights: [],
    };
  },
  created() {
    FlightService.getTageswertung()
      .then((response) => {
        this.flights = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },
  methods: {
    routeToFlight(flightId) {
      this.$router.push({
        name: "FlugDetails",
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
