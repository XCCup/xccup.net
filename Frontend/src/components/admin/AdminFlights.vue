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
            <th>LR Verletzung</th>
            <th>G-Check</th>
            <th>Nachricht an Pilot</th>
            <th>Akzeptieren</th>
            <th>Flug löschen</th>
          </thead>
          <tbody>
            <tr v-for="flight in flights" v-bind:item="flight" v-bind:key="flight.id">
              <td>
                <router-link
                  :to="{
                    name: 'Flight',
                    params: { flightId: flight.externalId },
                  }"
                >{{ flight.externalId }}</router-link>
              </td>
              <td>{{ flight.user.firstName }} {{ flight.user.lastName }}</td>
              <td>
                <BaseDate :timestamp="flight.createdAt" />
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
                <button @click="messagePilot(flight)" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-envelope"></i>
                </button>
              </td>
              <td>
                <button @click="onAcceptFlight(flight)" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-check2-circle"></i>
                </button>
              </td>
              <td>
                <button @click="onDeleteFlight(flight)" class="btn btn-outline-danger btn-sm">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <ModalConfirm
    @confirm-result="processConfirmResult"
    :messageBody="confirmMessage"
    :modalId="modalId"
  />
</template>

<script>
import ApiService from "@/services/ApiService.js";
import { useRouter } from "vue-router";
import BaseDate from "../BaseDate.vue";
import { Modal } from "bootstrap";

const KEY_DELETE = "DELETE";
const KEY_ACCEPT = "ACCEPT";
export default {
  data() {
    return {
      flights: [],
      router: null,
      confirmModal: null,
      confirmMessage: "",
      confirmType: "",
      modalId: "modalFlightConfirm",
      selectedFlight: null
    };
  },
  methods: {
    async fetchFlightsWithViolations() {
      const res = await ApiService.getFlightViolations();
      this.flights = res.data;
    },
    async processConfirmResult() {
      if (this.confirmType === KEY_DELETE) {
        const res = await ApiService.deleteFlight(this.selectedFlight.externalId);
      }
      if (this.confirmType === KEY_ACCEPT) {
        const res = await ApiService.acceptFlightViolations(this.selectedFlight.id);
      }
      await this.fetchFlightsWithViolations();
    },
    onDeleteFlight(flight) {
      this.confirmMessage = "Willst du diesen Flug wirklich löschen?"
      this.confirmType = KEY_DELETE
      this.selectedFlight = flight
      this.confirmModal.show()
    },
    onAcceptFlight(flight) {
      this.confirmMessage = "Willst du diesen Flug wirklich akzeptieren?"
      this.confirmType = KEY_ACCEPT
      this.selectedFlight = flight
      this.confirmModal.show()
    },
    async messagePilot(flight) {
      alert(
        "Entschuldigung, aber diese Funktion ist noch nicht implementiert."
      );
      //TODO Implement function
    },
  },
  async mounted() {
    this.router = useRouter();
    this.confirmModal = new Modal(
      document.getElementById(this.modalId)
    );
    await this.fetchFlightsWithViolations();
  },
  computed: {
    violationsPresent: function () {
      return this.flights.length > 0;
    },
  },
  components: { BaseDate },
};
</script>

<style>
</style>
