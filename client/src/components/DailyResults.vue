<template>
  <div class="bg-primary">
    <!-- This prevents long components on big screens but leaves a nasty background "blitzer" -->
    <div class="container-xl">
      <div id="cy-daily-ranking-panel" class="row">
        <div
          v-if="flights.length > 0 || liveFLights.length > 0"
          class="col-xl-5 col-lg-6 col-12"
        >
          <div class="pb-3 text-light">
            <h3>Live Flüge</h3>
            <!-- TODO: Beautify the hover -->
            <div>
              <table class="table table-hover table-primary">
                <tbody>
                  <tr
                    v-for="(flight, index) in liveFLights.slice(0, maxRows)"
                    :key="flight.id"
                    :item="flight"
                    :index="index"
                    @click="routeToLiveView()"
                    @mouseover="updateHighlightedFlight(flight.id)"
                    @mouseleave="updateHighlightedFlight(null)"
                  >
                    <td scope="row" class="hide-on-sm">{{ index + 1 }}</td>
                    <td>{{ flight.user.fullName }}</td>
                    <td>
                      Live
                      <i v-if="flight.isLive" class="bi bi-activity"></i>
                    </td>
                    <td class="no-line-break">
                      {{ Math.floor(flight.flightDistance) }} km
                    </td>
                    <td></td>
                    <td class="no-line-break hide-on-sm"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="flights.length > 0" class="pb-3 text-light">
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
              <table class="table table-hover table-primary">
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
                    <td>{{ flight.user.fullName }}</td>
                    <td>
                      {{ flight.takeoff?.name }}
                    </td>
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

        <div
          v-if="flights.length > 0 || liveFLights.length > 0"
          class="col-xl-7 col-lg-6 col-12 p-0 m-0"
        >
          <DailyResultsMap
            :highlighted-flight="highlightedFlightId"
            :tracks="dailyFlightsMapTracks"
          />
        </div>
        <div
          v-if="!(flights.length > 0) && !(liveFLights.length > 0)"
          class="text-center pb-3 text-light"
        >
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

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

type Fix = {
  lat: number;
  long: number;
  timestamp: number;
};

type LiveFlight = {
  user: { fullName: string };
  flightDistance: number;
  id: string;
  isLive: boolean;
  track: Fix[];
};

type Flight = {
  user: { fullName: string };
  takeoff: { name: string };
  id: string;
  externalId: number;
  flightDistance: number;
  takeoffTime: string;
  flightType: string;
  flightPoints: number;
  fixes: Fix[];
};

const props = defineProps<{
  flights: Flight[];
  liveFlights: LiveFlight[];
  highlightedFlight?: string;
  maxRows: number;
}>();

// Filter out live flight with distance < 20km
const FILTER_LIVE_FLIGHTS_LESS_THAN = 20;

const highlightedFlightId = ref<string | null>(null);
const router = useRouter();

const dailyFlightsMapTracks = computed(() => {
  if (!props.flights && !props.liveFlights) return;
  const tracks: { turnpoints: Fix[]; flightId: string }[] = [];

  if (props.flights) {
    props.flights.slice(0, props.maxRows).forEach((flight) => {
      if (!flight.fixes) return;
      tracks.push({
        flightId: flight.id,
        turnpoints: flight.fixes,
      });
    });
  }
  if (props.liveFlights) {
    props.liveFlights.slice(0, props.maxRows).forEach((flight) => {
      tracks.push({ turnpoints: flight.track, flightId: flight.id });
    });
  }

  return tracks;
});

const liveFLights = computed(() =>
  props.liveFlights
    .filter((flight) => flight.flightDistance > FILTER_LIVE_FLIGHTS_LESS_THAN)
    .sort((flight) => flight.flightDistance)
);

const currentYear = computed(() => new Date().getFullYear());

const updateHighlightedFlight = (flightId: string | null) =>
  (highlightedFlightId.value = flightId);

const routeToFlight = (flightId: number) => {
  router.push({
    name: "Flight",
    params: {
      flightId: flightId,
    },
  });
};

const routeToLiveView = () => router.push({ name: "Live" });
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
