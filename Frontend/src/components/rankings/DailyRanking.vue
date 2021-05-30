<template>
  <div class="row bg-primary">
    <div class="col-xl-5 col-md-6 col-12">
      <div v-if="flights" class="text-light p-4 pb-4">
        <h3>Tageswertung</h3>
        <table class="table table-primary text-light table-hover">
          <tbody>
            <tr
              v-for="(flight, index) in flights.slice(0, maxRows)"
              v-bind:item="flight"
              v-bind:index="index"
              v-bind:key="flight._id"
              @click="routeToFlight(flight.flightId)"
              @mouseover="updateHighlightedFlight(flight.flightId)"
              @mouseleave="updateHighlightedFlight(null)"
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
        <router-link
          :to="{ name: 'Flights' }"
          class="btn btn-outline-light btn-sm my-1"
          >Alle Flüge anzeigen</router-link
        >
      </div>
    </div>
    <div class="col-xl-7 col-md-6 col-12 p-0 m-0">
      <DailyFlightsMap :highlightedFlight="highlightedFlightId" />
    </div>
  </div>
</template>

<script>
import DailyFlightsMap from "@/components/DailyFlightsMap";

export default {
  name: "DailyRanking",
  components: { DailyFlightsMap },
  data() {
    return {
      highlightedFlightId: null,
    };
  },
  props: {
    flights: {
      type: Array,
      required: true,
    },
    maxRows: Number,
  },
  methods: {
    updateHighlightedFlight(flightId) {
      this.highlightedFlightId = flightId;
    },
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
