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
            <td>
              <BaseDate
                :timestamp="flight.dateOfFlight"
                dateFormat="dd.MM.yyyy"
              />
            </td>

            <td>{{ flight.User.firstName + " " + flight.User.lastName }}</td>
            <td>{{ flight.User.clubName }}</td>
            <td>{{ flight.User.teamName }}</td>
            <td>{{ flight.takeoff.name }}</td>
            <td>
              <i
                class="bi bi-trophy"
                :class="flight.glider.gliderClass.key"
              ></i>
            </td>
            <td>{{ flight.glider.brand + " " + flight.glider.model }}</td>

            <td>{{ Math.floor(flight.flightDistance) }} km</td>
            <td><FlightType :flightType="flight.flightType" /></td>
            <td>{{ flight.flightPoints }} P</td>
            <td>{{ flight.flightStatus }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import FlightType from "@/components/FlightType";

export default {
  name: "DailyRanking",
  components: { FlightType },

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
