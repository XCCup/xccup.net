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
            <th>Nachricht an Pilot</th>
            <th>Akzeptieren</th>
            <th>Flug löschen</th>
          </thead>
          <tbody>
            <tr
              v-for="flight in flights"
              v-bind:item="flight"
              v-bind:key="flight.id"
              @click="routeToFlight(flight.externalId)"
            >
              <td>
                {{ flight.externalId }}
              </td>
              <td>
                {{ flight.user.firstName }} {{ flight.user.lastName }}
              </td>
              <td>
                {{ flight.createdAt }}
              </td>
              <td v-if="flight.uncheckedGRecord">
                <i class="bi bi-exclamation-diamond text-danger"></i>
              </td>
              <td v-else>
                <i class="bi bi-slash-circle text-success"></i>
              </td>
              <td v-if="flight.airspaceViolation">
                <i class="bi bi-exclamation-diamond text-danger"></i>
              </td>
              <td v-else>
                <i class="bi bi-slash-circle text-success"></i>
              </td>
              <td>
                <button
                  @click="messagePilot(flight)"
                  class="btn btn-outline-primary btn-sm"
                >
                  <i class="bi bi-envelope"></i>
                </button>
              </td>
              <td>
                <button
                  @click="confirmFlight(flight)"
                  class="btn btn-outline-primary btn-sm"
                >
                  <i class="bi bi-check2-circle"></i>
                </button>
              </td>
              <td>
                <button
                  @click="deleteFlight(flight)"
                  class="btn btn-outline-danger btn-sm"
                >
                  <i class="bi bi-trash"></i>
                </button>
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
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      flights: [],
      router: {},
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
        const res = await ApiService.acceptFlightViolations(flight.id);
        await this.fetchFlightsWithViolations();
      }
    },
    async messagePilot(flight) {
      alert("Entschuldigung, aber diese Funktion ist noch nicht implementiert.");
      //TODO Implement function
    },
    async routeToFlight(externalId) {
      this.router.push({
        name: "Flight",
        params: {
          flightId: externalId,
        },
      });
    },
  },
  async created() {
    this.router = useRouter();
    await this.fetchFlightsWithViolations();
  },
  computed: {
    violationsPresent: function () {
      return this.flights.length > 0;
    },
  },
};
</script>

<style></style>
