<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="results?.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Platz</th>

            <th>Name</th>
            <th scope="col" class="d-none d-lg-table-cell">Verein</th>
            <th scope="col" class="d-none d-lg-table-cell">Team</th>

            <th v-for="n in maxFlights" :key="n">Flug {{ n }}</th>

            <th>Gesamt</th>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in results"
              v-bind:key="result.user.idex"
            >
              <td>{{ index + 1 }}</td>
              <td>
                <strong>{{
                  result.user.firstName + " " + result.user.lastName
                }}</strong>
              </td>
              <td scope="col" class="d-none d-lg-table-cell">
                {{ result.club?.name }}
              </td>
              <td scope="col" class="d-none d-lg-table-cell">
                {{ result.team?.name }}
              </td>

              <td v-for="n in maxFlights" :key="n">
                <router-link
                  v-if="result.flights[n - 1]"
                  :to="{
                    name: 'Flight',
                    params: { flightId: result.flights[n - 1].id },
                  }"
                >
                  {{ result.flights[n - 1]?.flightPoints ?? "-" }}
                </router-link>
                <div v-else>-</div>
              </td>

              <td>
                <strong>{{ result.totalPoints }} P </strong>({{
                  Math.floor(result.totalDistance)
                }}
                km)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>Keine Flüge gemeldet in diesem Jahr</div>
    </div>
  </section>
</template>

<script>
// import FlightTypeIcon from "@/components/FlightTypeIcon";
// import FlightState from "@/components/FlightState";

export default {
  name: "ResultsTable",
  components: {},

  props: {
    results: {
      type: Array,
      required: true,
    },
    maxFlights: {
      type: Number,
      required: true,
    },
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
/* tr:hover {
  
  -moz-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  -webkit-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);

  cursor: pointer;
} */
</style>
