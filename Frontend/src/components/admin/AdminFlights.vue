<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="violationsPresent" class="table-responsive">
          <h5>Ausstehende Flugprüfungen</h5>
  <table class="table table-striped table-hover text-sm">
      <thead>
        <th>ID</th>
        <th>Pilot</th>
        <th>Hochgeladen am</th>
        <th>Luftraumverletzung</th>
        <th>Invalider G-Check</th>
        <th>Akzeptieren</th>
        <th>Flug löschen</th>
      </thead>
      <tbody>
      <tr v-for="flight in flights" v-bind:item="flight" v-bind:key="flight.id">
        <td>
          <router-link :to="{ path: '/fluege/' + flight.externalId }">
            {{ flight.externalId }}
          </router-link>
        </td>
        <td>
          <router-link :to="{ path: '/pilot/' + flight.user.id }">
            {{ flight.user.firstName }} {{ flight.user.lastName }}
          </router-link>
        </td>
        <td>
          {{ flight.createdAt }}
        </td>
        <td v-if="flight.uncheckedGRecord">
          <i class="bi bi-exclamation-diamond violation-true"></i>
        </td>
        <td v-else>
          <i class="bi bi-slash-circle violation-false"></i>
        </td>
        <td v-if="flight.airspaceViolation">
          <i class="bi bi-exclamation-diamond violation-true"></i>
        </td>
        <td v-else>
          <i class="bi bi-slash-circle violation-false"></i>
        </td>
        <td>
          <button
            @click="confirmFlight(flight)"
            class="table-btn bi bi-check2-circle"
          ></button>
        </td>
        <td>
          <button
            @click="deleteFlight(flight)"
            class="table-btn bi bi-trash"
          ></button>
        </td>
      </tr>
    </tbody>
  </table>
  </div>
  </div>
  </section>
</template>

<script>
import ApiService from "@/services/ApiService.js";
export default {
  data() {
    return {
      flights: [],
    };
  },
  methods: {
    async fetchFlightsWithViolations() {
      const res = await ApiService.getFlightViolations();
      this.flights = res.data;
    },
    async deleteFlight(flight) {
      if (confirm("Bist du Dir wirklich sicher diesen Flug zu löschen?")) {
        const res = await ApiService.deleteFlight(flight.externalId);
        await this.fetchFlightsWithViolations();
      }
    },
    async confirmFlight(flight) {
      if (confirm("Bist du Dir wirklich sicher diesen Flug zu akzeptieren?")) {
        const res = await ApiService.acceptFlightViolations(flight.id)
        await this.fetchFlightsWithViolations();
      }
    },
  },
  async created() {
    await this.fetchFlightsWithViolations();
  },
  computed: {
    violationsPresent: function () {
      console.log("computed");
      console.log(this.flights.length !== 0);
      return this.flights.length !== 0;
    },
  },
};
</script>

<style>
.violation-true{
  color: var(--sad-color)
}
.violation-false{
  color: var(--happy-color);
}
</style>