<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="flights.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Datum</th>
            <th>Name</th>
            <th scope="col" class="d-none d-lg-table-cell">Verein</th>
            <th scope="col" class="d-none d-lg-table-cell">Team</th>

            <th>Startplatz</th>
            <th scope="col" class="d-none d-lg-table-cell">Gerät</th>
            <th>Strecke</th>
            <th></th>
            <th>Punkte</th>
            <th>Status</th>
          </thead>
          <tbody>
            <tr
              v-for="(flight, index) in flights.slice(0, maxRows)"
              v-bind:item="flight"
              v-bind:index="index"
              v-bind:key="flight.id"
              @click="routeToFlight(flight.externalId)"
            >
              <td>
                <BaseDate :timestamp="flight.takeoffTime" dateFormat="dd.MM" />
              </td>

              <td>{{ flight.User.firstName + " " + flight.User.lastName }}</td>
              <td scope="col" class="d-none d-lg-table-cell">
                {{ flight.Club.name }}
              </td>
              <td scope="col" class="d-none d-lg-table-cell">
                {{ flight.Team?.name }}
              </td>
              <td>{{ flight.takeoff.name }}</td>

              <td scope="col" class="d-none d-lg-table-cell">
                <i
                  class="bi bi-trophy"
                  :class="flight.glider?.gliderClass?.key ?? ``"
                ></i>
                {{ flight.glider?.brand + " " + flight.glider?.model }}
              </td>

              <td>{{ Math.floor(flight.flightDistance) }} km</td>
              <td><FlightTypeIcon :flightType="flight.flightType" /></td>
              <td>{{ flight.flightPoints }} P</td>
              <td><FlightState :flightState="flight.flightStatus" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>Keine Flüge gemeldet in diesem Jahr</div>
    </div>
  </section>
</template>

<script>
import FlightTypeIcon from "@/components/FlightTypeIcon";
import FlightState from "@/components/FlightState";

export default {
  name: "DailyRanking",
  components: { FlightTypeIcon, FlightState },

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
