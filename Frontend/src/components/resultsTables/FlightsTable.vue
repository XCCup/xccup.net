<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="flights?.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Datum</th>
            <th>Name</th>
            <th scope="col" class="hide-on-md">Verein</th>
            <th scope="col" class="hide-on-sm">Team</th>

            <th class="hide-on-sm">Startplatz</th>
            <th scope="col" class="hide-on-sm">Gerät</th>
            <th>Strecke</th>
            <th>Punkte</th>
            <th class="hide-on-sm">Status</th>
          </thead>
          <tbody>
            <tr
              v-for="(flight, index) in flights"
              :key="flight.id"
              :item="flight"
              :index="index"
              @click="routeToFlight(flight.externalId)"
            >
              <td>
                <BaseDate :timestamp="flight.takeoffTime" date-format="dd.MM" />
              </td>

              <td>
                <strong>{{
                  flight.user.firstName + " " + flight.user.lastName
                }}</strong>
              </td>
              <td scope="col" class="hide-on-md">
                {{ flight.club.name }}
              </td>
              <td scope="col" class="hide-on-sm">
                {{ flight.team?.name }}
              </td>
              <td class="hide-on-sm">{{ flight.takeoff.name }}</td>

              <td scope="col" class="hide-on-sm">
                <RankingClass :ranking-class="flight.glider?.gliderClass" />
                {{ flight.glider?.brand + " " + flight.glider?.model }}
              </td>

              <td class="no-line-break">
                {{ Math.floor(flight.flightDistance) }} km
              </td>
              <td class="no-line-break">
                <FlightTypeIcon :flight-type="flight.flightType" />
                {{ flight.flightPoints }} P
              </td>
              <td class="hide-on-sm">
                <FlightState :flight-state="flight.flightStatus" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>Keine Flüge gemeldet in diesem Jahr</div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

defineProps({
  flights: {
    type: Array,
    required: true,
  },
});
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
