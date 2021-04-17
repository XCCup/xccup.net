<template>
  <section class="bg-primary pb-3">
    <div class="container text-light pt-1">
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
