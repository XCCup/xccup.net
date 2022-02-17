<template>
  <section class="pb-3">
    <div v-if="flights.length > 0" id="adminFlightsPanel">
      <h5>Ausstehende Flugprüfungen</h5>
      <div class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>ID</th>
            <th>Pilot</th>
            <th>Hochgeladen am</th>
            <th>G-Check</th>
            <th>LR Verletzung</th>
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
              <td>
                <i
                  v-if="flight.uncheckedGRecord"
                  class="bi bi-exclamation-diamond text-danger"
                ></i>
                <i v-else class="bi bi-check-circle text-success"></i>
              </td>

              <td>
                <i
                  v-if="flight.airspaceViolation"
                  class="bi bi-exclamation-diamond text-danger"
                ></i>
              </td>

              <td>
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="onMessagePilot(flight)"
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
    <div v-else><h5>Keine ausstehenden Flugprüfungen</h5></div>
  </section>
  <BaseModal
    modal-title="Flug löschen?"
    modal-body="Dies kann nicht rückgängig gemacht werden"
    confirm-button-text="Löschen"
    modal-id="deleteFlightModal"
    :confirm-action="deleteFlight"
    :is-dangerous-action="true"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
  />
  <BaseModal
    modal-title="Flug akzeptieren?"
    modal-body="Dies kann nicht rückgängig gemacht werden"
    confirm-button-text="Akzeptieren"
    modal-id="acceptFlightModal"
    :confirm-action="acceptFlight"
    :is-dangerous-action="true"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
  />
  <!-- TODO: When using this modal the reply-to email address will be the 
  one of the admin account used and not info@xccup.net 
  Is that the way we want it to be? -->
  <ModalSendMail modal-id="messagePilotModal" :user="selectedUser" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import { useRouter } from "vue-router";
import BaseDate from "../BaseDate.vue";
import { Modal } from "bootstrap";
import { ref, onMounted, computed } from "vue";

const router = useRouter();

const flights = ref([]);
const showSpinner = ref(false);
const errorMessage = ref("");
const selectedFlight = ref(null);

const fetchFlightsWithViolations = async () => {
  const res = await ApiService.getFlightViolations();
  flights.value = res.data.rows;
};

try {
  await fetchFlightsWithViolations();
} catch (error) {
  console.log(error);
  router.push({
    name: "NetworkError",
  });
}

// Count and expose open flight tickets
const count = computed(() => flights.value.length);
defineExpose({
  count,
});

// Modals
const deleteFlightModal = ref(null);
const acceptFlightModal = ref(null);
const messagePilotModal = ref(null);
onMounted(() => {
  deleteFlightModal.value = new Modal(
    document.getElementById("deleteFlightModal")
  );
  acceptFlightModal.value = new Modal(
    document.getElementById("acceptFlightModal")
  );
  messagePilotModal.value = new Modal(
    document.getElementById("messagePilotModal")
  );
});

// Delete flight
const onDeleteFlight = (flight) => {
  selectedFlight.value = flight;
  deleteFlightModal.value.show();
};

const deleteFlight = async () => {
  showSpinner.value = true;
  try {
    await ApiService.deleteFlight(selectedFlight.value.externalId);
    await fetchFlightsWithViolations();
    deleteFlightModal.value.hide();
  } catch (error) {
    errorMessage.value = "Da ist leider was schief gelaufen";
    console.log(error);
  } finally {
    selectedFlight.value = null;
    showSpinner.value = false;
  }
};

// Accept flight
const onAcceptFlight = (flight) => {
  selectedFlight.value = flight;
  acceptFlightModal.value.show();
};

const acceptFlight = async () => {
  showSpinner.value = true;
  try {
    await ApiService.acceptFlightViolations(selectedFlight.value.id);
    await fetchFlightsWithViolations();
    acceptFlightModal.value.hide();
  } catch (error) {
    errorMessage.value = "Da ist leider was schief gelaufen";
    console.log(error);
  } finally {
    selectedFlight.value = null;
    showSpinner.value = false;
  }
};

// Message pilot
const selectedUser = ref(null);
const onMessagePilot = (flight) => {
  selectedUser.value = flight.user;
  messagePilotModal.value.show();
};
</script>

<style scoped></style>
