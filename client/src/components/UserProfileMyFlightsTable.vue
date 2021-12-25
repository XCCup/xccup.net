<template>
  <section class="pb-3">
    <div v-if="flights?.length > 0" class="table-responsive">
      <table class="table table-striped table-hover text-sm">
        <thead>
          <TableSortHead
            content="Datum"
            column-object-key="takeoffTime"
            :current-sort-column-key="currentSortColumnKey"
            @head-sort-changed="handleSortChange"
          />
          <th>Startplatz</th>
          <th scope="col" class="hide-on-sm">Gerät</th>
          <TableSortHead
            content="Strecke"
            column-object-key="flightDistance"
            :current-sort-column-key="currentSortColumnKey"
            @head-sort-changed="handleSortChange"
          />
          <!-- Is "Typ" the correct term? Remember to keep it short;) -->
          <th>Typ</th>

          <TableSortHead
            content="Punkte"
            column-object-key="flightPoints"
            :current-sort-column-key="currentSortColumnKey"
            class="hide-on-xs"
            @head-sort-changed="handleSortChange"
          />
          <th>Status</th>
          <th></th>
          <th></th>
        </thead>
        <tbody>
          <tr
            v-for="(flight, index) in flights"
            :key="flight.id"
            :item="flight"
            :index="index"
          >
            <td>
              <BaseDate
                :timestamp="flight.takeoffTime"
                date-format="dd.MM.yy"
              />
            </td>

            <td>{{ flight.takeoff.name }}</td>

            <td scope="col" class="hide-on-sm no-line-break">
              <RankingClass :ranking-class="flight.glider?.gliderClass" />
              {{ flight.glider?.brand + " " + flight.glider?.model }}
            </td>

            <td class="no-line-break">
              {{ Math.floor(flight.flightDistance) }} km
            </td>
            <td class="no-line-break">
              <FlightTypeIcon :flight-type="flight.flightType" />
            </td>
            <td class="no-line-break hide-on-xs">
              {{ flight.flightPoints }} P
            </td>
            <td>
              <FlightState :flight-state="flight.flightStatus" />
            </td>
            <td>
              <i
                v-if="
                  checkIfDateIsDaysBeforeToday(
                    flight.takeoffTime,
                    Constants.DAYS_FLIGHT_CHANGEABLE
                  )
                "
                class="bi bi-trash text-danger clickable"
                @click="onDeleteFlight(flight.externalId)"
              ></i>
            </td>

            <td>
              <i
                class="bi bi-chevron-right clickable"
                @click="routeToFlight(flight.externalId)"
              ></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>Keine Flüge gemeldet in diesem Jahr</div>
  </section>
  <BaseModal
    modal-title="Flug löschen?"
    modal-body="Dies kann nicht rückgängig gemacht werden"
    confirm-button-text="Löschen"
    modal-id="deleteFlightModal"
    :confirm-action="onConfirmDelete"
    :is-dangerous-action="true"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import useData from "@/composables/useData";
import { Modal } from "bootstrap";
import ApiService from "@/services/ApiService";
import useUser from "@/composables/useUser";
import { checkIfDateIsDaysBeforeToday } from "../helper/utils";
import Constants from "../common/Constants";

const { data: flights, sortDataBy, fetchData } = useData(ApiService.getFlights);
const router = useRouter();
const showSpinner = ref(false);
const errorMessage = ref("");

// Modal
const deleteFlightModal = ref(null);
onMounted(() => {
  deleteFlightModal.value = new Modal(
    document.getElementById("deleteFlightModal")
  );
});

// Fetch flights
const { getUserId } = useUser();

// TODO: Spinner needed?
await fetchData({ params: {}, queries: { userId: getUserId.value } });

const flightToDelete = ref(null);
const onDeleteFlight = (flightId) => {
  flightToDelete.value = flightId;
  deleteFlightModal.value.show();
};

const onConfirmDelete = () => deleteFlight(flightToDelete.value);

// TODO: Should there be a confirm message?
const deleteFlight = async (flightId) => {
  showSpinner.value = true;
  try {
    await ApiService.deleteFlight(flightId);
    flightToDelete.value = null;
    // await fetchFlights({ params: {}, queries: { userId: getUserId.value } });
    deleteFlightModal.value.hide();
  } catch (error) {
    // TODO: Error message in modal?
    errorMessage.value = "Da ist leider was schief gelaufen";
    showSpinner.value = false;
    console.log({ error });
  }
};

const currentSortColumnKey = ref(null);

const routeToFlight = (flightId) => {
  router.push({
    name: "Flight",
    params: {
      flightId,
    },
  });
};

const handleSortChange = (value) => {
  currentSortColumnKey.value = value.key;
  sortDataBy({
    sortCol: currentSortColumnKey.value,
    sortOrder: value.order,
  });
};
</script>
<style scoped></style>
