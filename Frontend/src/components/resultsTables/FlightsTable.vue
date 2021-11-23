<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="flights?.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <SortingTableHead
              content="Datum"
              column-object-key="takeoffTime"
              :current-sort-column-key="currentSortColumnKey"
              @head-sort-changed="handleSortChange"
            />
            <th>Name</th>
            <th scope="col" class="hide-on-md">Verein</th>
            <th scope="col" class="hide-on-sm">Team</th>

            <th class="hide-on-sm">Startplatz</th>
            <th scope="col" class="hide-on-sm">Gerät</th>
            <SortingTableHead
              content="Strecke"
              column-object-key="flightDistance"
              :current-sort-column-key="currentSortColumnKey"
              @head-sort-changed="handleSortChange"
            />
            <SortingTableHead
              content="Punkte"
              column-object-key="flightPoints"
              :current-sort-column-key="currentSortColumnKey"
              @head-sort-changed="handleSortChange"
            />
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
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const currentSortColumnKey = ref(null);

defineProps({
  flights: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["table-sort-changed"]);

const routeToFlight = (flightId) => {
  router.push({
    name: "Flight",
    params: {
      flightId: flightId,
    },
  });
};

const handleSortChange = (value) => {
  currentSortColumnKey.value = value.key;
  console.log("Handle: ", value);
  emit("table-sort-changed", {
    sortCol: value.order ? currentSortColumnKey.value : undefined,
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
</style>
