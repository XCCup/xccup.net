<template>
  <div class="row bg-primary">
    <div class="col-md-6 col-12">
      <section v-if="flights">
        <div class="container-fluid text-light p-2 ps-4 pb-4">
          <h3>Tageswertung</h3>
          <table class="table table-primary text-light table-hover">
            <tbody>
              <tr
                v-for="(flight, index) in flights.slice(0, maxRows)"
                v-bind:item="flight"
                v-bind:index="index"
                v-bind:key="flight._id"
                @click="routeToFlight(flight.flightId)"
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
      </section>
    </div>
    <div class="col-md-6 col-12 p-0 m-0">
      <DailyFlightsMap />
    </div>
  </div>
</template>

<script>
import DailyFlightsMap from "@/components/DailyFlightsMap";

export default {
  name: "DailyRanking",
  components: { DailyFlightsMap },
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
