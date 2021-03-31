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
                    params: {
                      flightId: '605e2181b2b5a2de2e0c6f63' /*flight._id*/,
                    },
                  }"
                >
                  Zum Flug <i class="bi bi-arrow-right"></i>
                </router-link>
              </td>
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
  // async created() {
  //   try {
  //     this.flights = await FlightService.getFlights();
  //   } catch (err) {
  //     this.error = err.message;
  //   }
  // },
};
</script>
<style scoped></style>
