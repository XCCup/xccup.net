<template>
  <div v-if="flights" id="cy-daily-ranking-panel" class="row bg-primary">
    <div class="col-xl-5 col-lg-6 col-12">
      <div class="text-light p-4 pb-4">
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
        <div v-if="flights.length > 0">
          <table class="table text-light table-hover">
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
                <td scope="row">{{ index + 1 }}</td>
                <td>
                  {{ flight.user.firstName + " " + flight.user.lastName }}
                </td>
                <td>{{ flight.takeoff.name }}</td>
                <td class="no-line-break">
                  {{ Math.floor(flight.flightDistance) }} km
                </td>
                <td class="no-line-break">
                  <FlightTypeIcon :flight-type="flight.flightType" />
                  {{ flight.flightPoints }} P
                </td>
              </tr>
            </tbody>
          </table>
          <router-link
            :to="{ name: 'FlightsAll', params: { year: currentYear } }"
            class="btn btn-outline-light btn-sm my-1"
            >Alle Flüge anzeigen</router-link
          >
        </div>
        <div v-else class="text-center mt-5">
          <p class="fs-1">🌧 💨 🤯</p>
          Heute noch keine eingereichten Flüge vorhanden
        </div>
      </div>
    </div>
    <div class="col-xl-7 col-lg-6 col-12 p-0 m-0">
      <DailyFlightsMap
        :highlighted-flight="highlightedFlightId"
        :tracks="dailyFlightsMapTracks"
      />
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
