<template>
  <section class="pb-3">
    <div v-if="flights?.length > 0" v-memo="[flights]" class="table-responsive">
      <table class="table table-striped table-hover text-sm">
        <thead>
          <TableSortHead
            content="Datum"
            column-object-key="takeoffTime"
            :current-sort-column-key="currentSortColumnKey"
            @head-sort-changed="handleSortChange"
          />
          <th class="hide-on-xs"></th>
          <th>Name</th>
          <th scope="col" class="hide-on-md">Verein</th>
          <th scope="col" class="hide-on-sm">Team</th>
          <th class="hide-on-sm">Startplatz</th>
          <th scope="col" class="hide-on-sm">Gerät</th>
          <TableSortHead
            content="Strecke"
            column-object-key="flightDistance"
            :current-sort-column-key="currentSortColumnKey"
            @head-sort-changed="handleSortChange"
          />
          <TableSortHead
            content="Punkte"
            column-object-key="flightPoints"
            :current-sort-column-key="currentSortColumnKey"
            class="hide-on-sm"
            @head-sort-changed="handleSortChange"
          />
          <th class="hide-on-xs">Status</th>
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
              <table>
                <tr>
                  <td>
                    <BaseDate
                      :timestamp="flight.takeoffTime"
                      :date-format="$route.params.year ? 'dd.MM' : 'dd.MM.yy'"
                    />
                  </td>
                </tr>
                <tr class="d-md-none">
                  <td class="fw-lighter max-width-11ch">
                    {{ flight.takeoff?.name }}
                  </td>
                </tr>
              </table>
            </td>
            <td class="hide-on-xs px-0 mx-0">
              <!-- TODO: Find an elegant way to integrate this on sm and xs -->
              <FlightInfoIcons :flight="flight" />
            </td>
            <td>
              <table>
                <tr>
                  <td>
                    <strong>{{
                      flight.user?.firstName + " " + flight.user?.lastName
                    }}</strong>
                  </td>
                </tr>
                <tr class="d-md-none">
                  <td scope="col">
                    <RankingClass :ranking-class="flight.glider?.gliderClass" />
                    {{ flight.glider?.model }}
                  </td>
                </tr>
              </table>
            </td>
            <td scope="col" class="hide-on-md">
              {{ flight.club?.name }}
            </td>
            <td scope="col" class="hide-on-sm">
              {{ flight.team?.name }}
            </td>
            <td class="hide-on-sm">
              {{ flight.takeoff?.name }}
              <i v-if="flight.hikeAndFly > 0" class="bi bi-signpost-2"></i>
            </td>

            <td scope="col" class="hide-on-sm d-lg-none no-line-break">
              <RankingClass :ranking-class="flight.glider?.gliderClass" />
              {{ flight.glider?.model }}
            </td>
            <td scope="col" class="hide-on-md no-line-break">
              <RankingClass :ranking-class="flight.glider?.gliderClass" />
              {{ flight.glider?.brand + " " + flight.glider?.model }}
            </td>
            <td>
              <table>
                <tr>
                  <td class="no-line-break">
                    {{ Math.floor(flight.flightDistance) }} km
                    <FlightTypeIcon :flight-type="flight.flightType" />
                  </td>
                </tr>
                <tr class="d-md-none">
                  <td class="fw-lighter no-line-break">
                    {{ flight.flightPoints }} P
                  </td>
                </tr>
              </table>
            </td>

            <td class="no-line-break hide-on-sm">
              {{ flight.flightPoints }} P
            </td>
            <td class="hide-on-xs">
              <FlightState :flight-state="flight.flightStatus" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else data-cy="no-flights-listed">
      Keine Flüge gemeldet in diesem Jahr
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import useData from "../composables/useData";
import FlightInfoIcons from "./FlightInfoIcons.vue";

const { data: flights, sortDataBy } = useData();
const router = useRouter();

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
<style scoped>
tr:hover {
  /* 
  -moz-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  -webkit-box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.1); */

  cursor: pointer;
}

.max-width-11ch {
  overflow: hidden;
  max-width: 11ch;
}
.max-width-1ch {
  overflow: hidden;
  max-width: 11ch;
}
</style>
