<template>
  <section class="topFluege bg-primary text-light pb-3">
    <div class="container pt-1">
      <h3>Tageswertung</h3>
      <div class="text-light">
        <div class="flights"></div>
        <table class="table text-light">
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            <tr
              v-for="(flight, index) in flights.slice(0, maxRows)"
              v-bind:item="flight"
              v-bind:index="index"
              v-bind:key="flight._id"
              @click="routeToFlight(flight.flightId)"
            >
              <td scope="row">{{ index + 1 }}</td>
              <td>{{ flight.date }}</td>
              <td>{{ flight.pilot }}</td>
              <td>{{ flight.takeoff }}</td>
              <td>{{ flight.distance }} km</td>
              <td>{{ flight.taskType }}</td>

              <td>{{ flight.points }} P</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a href="#" class="btn btn-outline-light btn-sm my-1"
        >Alle Flüge anzeigen</a
      >
    </div>
  </section>
  <!-- Karte der Tageswertung -->

  <section class="dailyMap">
    <div class="container">
      <h3>Karte mit Overlays aller Flüge des Tages</h3>
      <p>Soll hier mal irgendwo hin…</p>

      <br />
    </div>
  </section>
</template>

<script>
import FlightService from "@/services/FlightService";
export default {
  name: "Tageswertung",
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
  props: {
    maxRows: Number,
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
<style scoped>
tr:hover {
  /* background-color: hsl(0, 0%, 10%); */
  /* filter: brightness(150%); */
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);

  cursor: pointer;
}
</style>
