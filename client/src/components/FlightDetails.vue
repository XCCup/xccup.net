<template>
  <section id="flight-details" class="container">
    <FlightDetailsPilot />
    <h3>Flugeigenschaften</h3>
    <div class="row">
      <div class="col-md-6 col-12 my-1">
        <table id="cyFlightDetailsTable1" class="table table-sm">
          <tbody>
            <tr>
              <th>Gerät</th>
              <td>{{ flight?.glider?.brand }} {{ flight?.glider?.model }}</td>
            </tr>
            <tr>
              <th>Geräteklasse</th>
              <td>
                <RankingClass
                  :ranking-class="flight?.glider?.gliderClass"
                  :short="true"
                  :show-description="true"
                />
                <FeatherIcon
                  v-if="flight?.glider?.reynoldsClass"
                  class="ms-1"
                />
              </td>
            </tr>
            <tr>
              <th>Hike & Fly</th>
              <td>
                <div v-if="isHikeAndFly">
                  <i class="bi bi-signpost-2 me-1"></i>{{ flight?.hikeAndFly }}m
                  Höhenunterschied
                </div>
                <div v-else>-</div>
              </td>
            </tr>
            <tr>
              <th>Uhrzeit</th>
              <td v-if="true">
                <i class="bi bi-arrow-up"></i>
                <BaseDate
                  :timestamp="flight?.takeoffTime"
                  date-format="HH:mm"
                />
                Uhr <i class="bi bi-arrow-down"></i>
                <BaseDate
                  :timestamp="flight?.landingTime"
                  date-format="HH:mm"
                />
                Uhr
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-6 col-12 my-1">
        <table id="cyFlightDetailsTable2" class="table table-sm">
          <tbody>
            <tr>
              <th>Flugzeit</th>
              <td>
                {{ formatFlightDuration(flight?.airtime) }}
              </td>
            </tr>
            <tr>
              <th>Strecke</th>
              <td v-if="flight?.flightDistance">
                {{ flight?.flightDistance.toFixed(2) }} km
                <FlightTypeIcon :flight-type="flight?.flightType" />
              </td>
              <td v-else><i class="bi bi-hourglass-split"></i></td>
            </tr>
            <tr>
              <th>Punkte</th>
              <td v-if="flight?.flightStatus != 'In Prüfung'">
                {{ flight?.flightPoints }}
              </td>
              <td v-else><i class="bi bi-hourglass-split"></i></td>
            </tr>

            <tr>
              <th>Startplatz</th>
              <td>
                <router-link
                  :to="{
                    name: 'FlightsAll',
                    query: { siteId: flight?.takeoff?.id },
                  }"
                >
                  {{ flight?.takeoff?.name }} {{ flight?.takeoff?.direction }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Details Button -->
    <button
      id="flightDetailsButton"
      class="btn btn-primary btn-sm me-2 dropdown-toggle mt-1"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#flightDetailsCollapse"
    >
      Details anzeigen
    </button>
    <!-- METAR Button -->
    <button
      v-if="flight?.flightMetarData"
      id="metarButton"
      class="btn btn-primary btn-sm me-2 dropdown-toggle mt-1"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#metarDetailsCollapse"
    >
      METAR anzeigen
    </button>
    <!-- Download .igc -->
    <a :href="igcDownloadUrl"
      ><button type="button" class="btn btn-sm btn-outline-primary me-2 mt-1">
        <i class="bi bi-cloud-download"></i> .igc
      </button></a
    >
    <!-- Edit Flight -->
    <router-link
      :to="{ name: 'FlightEdit', params: { id: flight?.externalId } }"
    >
      <button
        v-if="showEditButton"
        class="btn btn-outline-primary btn-sm me-2 mt-1"
      >
        <i class="bi bi-pencil-square mx-1"></i>Flug bearbeiten
      </button>
    </router-link>
    <!-- Admin Dropdown -->
    <span v-if="hasElevatedRole" class="dropdown">
      <button
        id="admin-options-dropdown"
        class="btn btn-sm btn-outline-danger dropdown-toggle mt-1"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="bi bi-speedometer2 me-1"></i> Admin
      </button>
      <ul
        class="dropdown-menu"
        aria-labelledby="admin-options-dropdown"
        data-cy="admin-flight-options"
      >
        <li>
          <router-link
            class="dropdown-item"
            :to="{ name: 'FlightEdit', params: { id: flight?.externalId } }"
            ><i class="bi bi-pencil-square mx-1"></i>Flug bearbeiten
          </router-link>
        </li>

        <li>
          <a class="dropdown-item" href="#" @click.prevent="onRedoCalculation">
            <i class="bi bi-calculator mx-1"></i>Neuberechnen
            <BaseSpinner v-if="isCalculating" />
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="onReloadMetar">
            <i class="bi bi-cloud mx-1"></i>METAR reload
            <BaseSpinner v-if="isFetchingMetar" />
          </a>
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="onClaimAirspaceViolation"
          >
            <i class="bi bi-exclamation-circle mx-1"></i>LVR reklamieren
          </a>
        </li>
      </ul>
    </span>

    <!-- Flight Details Collapse -->
    <div id="flightDetailsCollapse" class="collapse mt-2">
      <div class="row">
        <div class="col-md-6 col-12">
          <table id="moreFlightDetailsTable" class="table table-sm">
            <tbody>
              <tr>
                <th>Flugstatus</th>
                <td>
                  {{ flight?.flightStatus }}
                  <FlightState :flight-state="flight?.flightStatus" />
                </td>
              </tr>
              <tr>
                <th>Höhe min/max (GPS)</th>
                <td>
                  {{ flight?.flightStats.minHeightGps }}m /
                  {{ flight?.flightStats.maxHeightGps }}m
                </td>
              </tr>
              <tr>
                <th>Max. Steigen</th>
                <td>{{ flight?.flightStats.maxClimb }} m/s</td>
              </tr>
              <tr>
                <th>Max. Sinken</th>
                <td>{{ flight?.flightStats.maxSink }} m/s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <tbody>
              <tr>
                <th>Landeplatz</th>
                <td>{{ flight?.landing }}</td>
              </tr>
              <tr>
                <th>Geschwindigkeit max</th>
                <td>
                  {{ Math.floor(flight?.flightStats.maxSpeed ?? 0) }} km/h
                </td>
              </tr>
              <tr>
                <th>Aufgaben-Geschwindigkeit</th>
                <td>{{ flight?.flightStats.taskSpeed ?? "?" }} km/h</td>
              </tr>
              <tr>
                <th>Eingereicht am</th>
                <td>
                  <BaseDate
                    :timestamp="flight?.createdAt"
                    date-format="dd.MM.yyyy HH:mm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- METAR Collapse -->
    <div
      v-if="flight?.flightMetarData"
      id="metarDetailsCollapse"
      class="collapse mt-2"
    >
      <code v-for="(metar, index) in flight.flightMetarData" :key="index"
        >{{ metar }}<br
      /></code>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import useAuth from "@/composables/useAuth";
import useFlight from "@/composables/useFlight";
import { getbaseURL } from "@/helper/baseUrlHelper";
import { checkIfDateIsDaysBeforeToday } from "../helper/utils";
import { DAYS_FLIGHT_CHANGEABLE } from "../common/Constants";
import ApiService from "@/services/ApiService";
import useSwal from "@/composables/useSwal";
import { formatFlightDuration } from "@/helper/formatFlightDuration";
import { FLIGHT_STATUS } from "@/types/Flight";

const { getUserId, hasElevatedRole } = useAuth();
const { flight } = useFlight();
const { showSuccessToast, showSuccessAlert, showFailedToast } = useSwal();

// Recalc flight
const isCalculating = ref(false);
const onRedoCalculation = async () => {
  try {
    isCalculating.value = true;
    if (!flight.value?.id) throw Error("No flight id");
    const res = await ApiService.rerunFlightCalculation(flight.value.id);
    const hasViolation = res.data.airspaceViolation;
    hasViolation
      ? showSuccessAlert(
          "Flug erfolgreich neu berechnet. Allerdings wurde eine Luftraumverletzung entdeckt."
        )
      : showSuccessToast("Flug erfolgreich neu berechnet.");
  } catch (error) {
    console.error(error);
    showFailedToast("Flug Berechnung gescheitert!");
  } finally {
    isCalculating.value = false;
  }
};
// METAR
const isFetchingMetar = ref(false);
const onReloadMetar = async () => {
  try {
    isFetchingMetar.value = true;
    if (!flight.value?.id) throw Error("No flight id");
    const res = await ApiService.fetchMetar(flight.value.id);

    if (res.status == 204) return showFailedToast("Keine METAR Daten gefunden");

    if (res.status != 200) throw res.statusText;
    showSuccessToast("METAR Daten erfolgreich abgefragt");
  } catch (error) {
    console.error(error);
    showFailedToast("METAR Abfrage gescheitert! " + error);
  } finally {
    isFetchingMetar.value = false;
  }
};
// RECLAIM AIRSPACE VIOLATION
const onClaimAirspaceViolation = async () => {
  try {
    if (!flight.value?.id) throw Error("No flight id");
    const res = await ApiService.changeFlightProps(flight.value.id, {
      flightStatus: FLIGHT_STATUS.IN_REVIEW,
      airspaceViolation: true,
    });

    if (res.status != 200) throw res.statusText;
    showSuccessToast(
      `Der Status wurde erfolgreich auf "${FLIGHT_STATUS.IN_REVIEW}" geändert`
    );
  } catch (error) {
    console.error(error);
    showFailedToast("Statusänderung gescheitert! " + error);
  }
};

const showEditButton = computed(() => {
  if (!flight.value) return false;
  const isAuthor = flight.value?.userId === getUserId.value;
  const flightIsEditable = checkIfDateIsDaysBeforeToday(
    flight.value.takeoffTime,
    DAYS_FLIGHT_CHANGEABLE
  );
  return isAuthor && flightIsEditable;
});

const igcDownloadUrl = computed(() => {
  const baseURL = getbaseURL();
  return baseURL + "flights/igc/" + flight.value?.id;
});

const isHikeAndFly = computed((): boolean => {
  if (!flight.value?.hikeAndFly) return false;
  return flight.value?.hikeAndFly > 0;
});
</script>

<style scoped></style>
