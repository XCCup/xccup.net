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
            <tr v-for="flight in flights" :key="flight.id" :item="flight">
              <td>
                <router-link
                  :to="{
                    name: 'Flight',
                    params: { flightId: flight.externalId },
                  }"
                  >{{ flight.externalId }}</router-link
                >
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
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="messagePilot(flight)"
                >
                  <i class="bi bi-envelope"></i>
                </button>
              </td>
              <td>
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="onAcceptFlight(flight)"
                >
                  <i class="bi bi-check2-circle"></i>
                </button>
              </td>
              <td>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="onDeleteFlight(flight)"
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
  <BaseModal
    :modal-title="modalTitle"
    :modal-body="confirmMessage"
    :confirm-button-text="modalButtonText"
    :modal-id="modalId"
    :confirm-action="processConfirmResult"
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
  components: { BaseDate },
  data() {
    return {
      flights: [],
      router: null,
      confirmModal: null,
      confirmMessage: "",
      confirmType: "",
      modalId: "modalFlightConfirm",
      modalTitle: "",
      modalButtonText: "",
      selectedFlight: null,
    };
  },
  computed: {
    violationsPresent: function () {
      return this.flights.length > 0;
    },
  },
  async mounted() {
    this.router = useRouter();
    this.confirmModal = new Modal(document.getElementById(this.modalId));
    await this.fetchFlightsWithViolations();
  },
  methods: {
    async fetchFlightsWithViolations() {
      const res = await ApiService.getFlightViolations();
      this.flights = res.data;
    },
    async processConfirmResult() {
      if (this.confirmType === KEY_DELETE) {
        await ApiService.deleteFlight(this.selectedFlight.externalId);
      }
      if (this.confirmType === KEY_ACCEPT) {
        await ApiService.acceptFlightViolations(this.selectedFlight.id);
      }
      await this.fetchFlightsWithViolations();
    },
    onDeleteFlight(flight) {
      this.confirmType = KEY_DELETE;
      this.modalTitle = "Flug löschen?";
      this.confirmMessage = "Willst du diesen Flug wirklich löschen?";
      this.modalButtonText = "Löschen";
      this.selectedFlight = flight;
      this.confirmModal.show();
    },
    onAcceptFlight(flight) {
      this.confirmType = KEY_ACCEPT;
      this.modalTitle = "Flug akzeptieren?";
      this.confirmMessage = "Willst du diesen Flug wirklich akzeptieren?";
      this.modalButtonText = "Akzeptieren";
      this.selectedFlight = flight;
      this.confirmModal.show();
    },
    /* eslint-disable no-unused-vars */
    async messagePilot(flight) {
      alert(
        "Entschuldigung, aber diese Funktion ist noch nicht implementiert."
      );
      //TODO Implement function
    },
  },
};
</script>

<style></style>
