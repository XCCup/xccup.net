<template>
  <div class="bg-primary">
    <!-- This prevents long components on big screens but leaves a nasty background "blitzer" -->
    <div class="container-xl">
      <div id="cy-daily-ranking-panel" class="row">
        <div v-if="flights.length > 0" class="col-xl-5 col-lg-6 col-12">
          <div class="pb-3 text-light">
            <h3>
              Tageswertung
              <BaseDate
                v-if="flights[0]?.takeoffTime"
                class="fs-6"
                :timestamp="flights[0]?.takeoffTime"
                date-format="dd.MM.yyyy"
              />
            </h3>
            <!-- TODO: Beautify the hover -->
            <div>
              <table class="table table-hover text-light bg-primary">
                <tbody>
                  <tr
                    v-for="(flight, index) in flights.slice(0, maxRows)"
                    :key="flight.id"
                    :item="flight"
                    :index="index"
                    @click="routeToFlight(flight.externalId)"
                    @mouseover="updateHighlightedFlight(flight.id)"
                    @mouseleave="updateHighlightedFlight(null)"
                  >
                    <td scope="row" class="hide-on-sm">{{ index + 1 }}</td>
                    <td>
                      {{ flight.user.firstName + " " + flight.user.lastName }}
                    </td>
                    <td>{{ flight.takeoff.name }}</td>
                    <td class="no-line-break">
                      {{ Math.floor(flight.flightDistance) }} km
                    </td>
                    <td>
                      <FlightTypeIcon :flight-type="flight.flightType" />
                    </td>
                    <td class="no-line-break hide-on-sm">
                      {{ flight.flightPoints }} P
                    </td>
                  </tr>
                </tbody>
              </table>
              <router-link
                :to="{ name: 'FlightsAll', params: { year: currentYear } }"
                class="btn btn-outline-light btn-sm"
                >Alle Flüge anzeigen</router-link
              >
            </div>
          </div>
        </div>

        <div v-if="flights.length > 0" class="col-xl-7 col-lg-6 col-12 p-0 m-0">
          <DailyResultsMap
            :highlighted-flight="highlightedFlightId"
            :tracks="dailyFlightsMapTracks"
          />
        </div>
        <div v-if="!flights.length > 0" class="text-center pb-3 text-light">
          <h3>Tageswertung</h3>
          <p class="fs-1">
            <i class="bi bi-cloud-lightning-rain mx-2"></i>
            <i class="bi bi-emoji-angry mx-2"></i>
          </p>
          Heute noch keine eingereichten Flüge vorhanden
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  flights: {
    type: Array,
    required: true,
  },
  maxRows: { type: Number, required: true },
});

const highlightedFlightId = ref(null);
const router = useRouter();

const dailyFlightsMapTracks = computed(() => {
  if (!props.flights) return;
  let tracks = [];

  props.flights.slice(0, props.maxRows).forEach((flight) => {
    tracks.push({
      flightId: flight.id,
      externalId: flight.externalId,
      turnpoints: flight.fixes,
    });
  });
  return tracks;
});

const currentYear = computed(() => new Date().getFullYear());

const updateHighlightedFlight = (flightId) =>
  (highlightedFlightId.value = flightId);

const routeToFlight = (flightId) => {
  router.push({
    name: "Flight",
    params: {
      flightId: flightId,
    },
  });
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
