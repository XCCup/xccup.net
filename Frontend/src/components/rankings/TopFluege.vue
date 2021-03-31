<template>
  <table class="table">
    <thead>
      <tr></tr>
    </thead>
    <tbody>
      <tr
        v-for="(flight, index) in flights.slice(0, 5)"
        v-bind:item="flight"
        v-bind:index="index"
        v-bind:key="flight._id"
      >
        <th scope="row">{{ index + 1 }}</th>
        <td>{{ flight.date }}</td>
        <td>{{ flight.pilot }}</td>
        <td>{{ flight.takeoff }}</td>
        <td>{{ flight.distance }} km</td>
        <td>{{ flight.taskType }}</td>
        <td>{{ flight.points }} P</td>
        <td>
          <router-link
            :to="{
              name: 'FlugDetails',
              params: { flightId: '605e2181b2b5a2de2e0c6f63' /*flight._id*/ },
            }"
          >
            Zum Flug <i class="bi bi-arrow-right"></i>
          </router-link>
        </td>
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
};
</script>

<style scoped lang="scss"></style>
