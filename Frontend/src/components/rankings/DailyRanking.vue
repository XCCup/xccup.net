<template>
  <div class="row bg-primary">
    <div class="col-xl-5 col-md-6 col-12">
      <div class="text-light p-4 pb-4">
        <h3>
          Tageswertung
          <BaseDate
            v-if="flights[0]?.takeoffTime"
            class="fs-6"
            :timestamp="flights[0]?.takeoffTime"
            dateFormat="dd.MM.yyyy"
          />
        </h3>

        <div v-if="flights.length > 0">
          <table class="table table-primary text-light table-hover">
            <tbody>
              <tr
                v-for="(flight, index) in flights.slice(0, maxRows)"
                v-bind:item="flight"
                v-bind:index="index"
                v-bind:key="flight.id"
                @click="routeToFlight(flight.externalId)"
                @mouseover="updateHighlightedFlight(flight.id)"
                @mouseleave="updateHighlightedFlight(null)"
              >
                <td scope="row">{{ index + 1 }}</td>
                <td>
                  {{ flight.User.firstName + " " + flight.User.lastName }}
                </td>
                <td>{{ flight.takeoff.name }}</td>
                <td>{{ Math.floor(flight.flightDistance) }} km</td>
                <td><FlightTypeIcon :flightType="flight.flightType" /></td>
                <td>{{ flight.flightPoints }} P</td>
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
      <div></div>
    </div>
    <div class="col-xl-7 col-md-6 col-12 p-0 m-0">
      <DailyFlightsMap
        :highlightedFlight="highlightedFlightId"
        :tracks="dailyFlightsMapTracks"
      />
    </div>
  </div>
</template>

<script>
import DailyFlightsMap from "@/components/DailyFlightsMap";
import FlightTypeIcon from "@/components/FlightTypeIcon";

import { computed, ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "DailyRanking",
  components: { DailyFlightsMap, FlightTypeIcon },
  //
  props: {
    flights: {
      type: Array,
      required: true,
    },
    maxRows: Number,
  },
  setup(props) {
    const highlightedFlightId = ref(null);
    const router = useRouter();

    const dailyFlightsMapTracks = computed(() => {
      if (!props.flights) return;
      let tracks = [];

      props.flights.slice(0, props.maxRows).forEach((flight) => {
        tracks.push({
          flightId: flight.id,
          turnpoints: flight.fixes,
        });
      });
      return tracks;
    });

    const currentYear = computed(() => new Date(Date.now()).getFullYear());

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

    return {
      highlightedFlightId,
      dailyFlightsMapTracks,
      currentYear,
      updateHighlightedFlight,
      routeToFlight,
    };
  },
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
