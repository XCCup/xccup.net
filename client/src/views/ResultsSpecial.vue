<template>
  <div class="container-lg">
    <div v-if="results">
      <h3 v-once>{{ title }} {{ route.params?.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="my-2"><SelectSeason /></div>

      <section class="pb-3">
        <div v-if="results?.length > 0" class="table-responsive">
          <table class="table table-striped table-hover text-sm">
            <thead>
              <th>Platz</th>
              <th>Datum</th>
              <th>Name</th>
              <th class="hide-on-xs">Startplatz</th>
              <th scope="col" class="hide-on-sm">Verein</th>
              <th class="no-line-break">Strecke</th>
              <th class="no-line-break hide-on-sm">Punkte</th>
            </thead>
            <tbody>
              <tr
                v-for="(result, index) in results"
                :key="result.user.id"
                @click="routeToFlight(result.externalId)"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <BaseDate
                    :timestamp="result.takeoffTime"
                    date-format="dd.MM"
                  />
                </td>
                <td>
                  <strong>{{
                    result.user.firstName + " " + result.user.lastName
                  }}</strong>
                </td>
                <td class="hide-on-xs">
                  {{ result.takeoff.name }}
                </td>
                <td scope="col" class="hide-on-sm">
                  {{ result.club?.name }}
                </td>
                <td scope="col">
                  <FlightTypeIcon :flight-type="result.flightType" />
                  {{ Math.round(result.flightDistance) }} km
                </td>
                <td class="no-line-break hide-on-sm">
                  <RankingClass :ranking-class="result.glider.gliderClass" />
                  {{ result.flightPoints }} P
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="results?.length === 0 && !noDataFlag && category == 'earlyBird'"
        >
          Keine Flüge gemeldet in diesem Jahr.
        </div>
        <div
          v-if="results?.length === 0 && !noDataFlag && category == 'lateBird'"
        >
          <br />Die Late Bird Wertung beginnt erst im letzten Viertel der
          Saison.
        </div>
        <div v-if="noDataFlag" data-cy="no-data">
          Keine Wertung für dieses Jahr vorhanden.
        </div>
      </section>
    </div>
    <GenericError v-else />
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute, useRouter } from "vue-router";
import useData from "../composables/useData";

const route = useRoute();
const router = useRouter();
const title = ref("");

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
});

const categories = {
  earlyBird: {
    title: "Early Bird",
    endpoint: ApiService.getResultsEarlybird,
  },
  lateBird: {
    title: "Late Bird",
    endpoint: ApiService.getResultsLatebird,
  },
};

const selectedCategory = categories[props.category];
if (!selectedCategory) throw "No supported category for " + props.category;
title.value = selectedCategory.title;

setWindowName(title.value);

const { initData, data: results, dataConstants, noDataFlag } = useData();

// Prevent to send a request query with an empty year parameter
const params = route.params.year ? route.params : undefined;
// Await is necessary to trigger the suspense feature
await initData(selectedCategory.endpoint, {
  queryParameters: {
    ...route.query,
    ...params,
  },
});

const routeToFlight = (flightId) => {
  router.push({
    name: "Flight",
    params: {
      flightId,
    },
  });
};
const remark = ref(dataConstants.value?.REMARKS);
</script>

<style scoped>
tr:hover {
  cursor: pointer;
}
</style>
