<template>
  <section v-if="flights" class="pb-3">
    <div class="container pt-1">
      <h3>Streckenmeldungen 20XX</h3>
      <table class="table table-hover">
        <tbody>
          <tr
            v-for="(flight, index) in flights.slice(0, maxRows)"
            v-bind:item="flight"
            v-bind:index="index"
            v-bind:key="flight.id"
            @click="routeToFlight(flight.externalId)"
          >
            <td scope="row">{{ index + 1 }}</td>
            <td>{{ flight.pilot }}</td>
            <td>{{ flight.takeoff }}</td>
            <td>{{ flight.distance }} km</td>
            <td>{{ flight.taskType }}</td>
            <td>{{ flight.points }} P</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  name: "DailyRanking",
  props: {
    flights: {
      type: Array,
      required: true,
    },
    maxRows: Number,
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
<style scoped>
tr:hover {
  /* 
  -moz-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  -webkit-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1); */

  cursor: pointer;
}
</style>
