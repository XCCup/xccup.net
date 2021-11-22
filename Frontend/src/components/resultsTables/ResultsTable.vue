<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="results.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Platz</th>

            <th>Name</th>
            <th scope="col" class="hide-on-sm">Verein</th>
            <th scope="col" class="hide-on-sm">Team</th>

            <th v-for="n in maxFlights" :key="n" class="no-line-break">
              Flug {{ n }}
            </th>

            <th>Gesamt</th>
          </thead>
          <tbody>
            <tr v-for="(result, index) in results" :key="result.user.idex">
              <td>{{ index + 1 }}</td>
              <td>
                <strong>{{
                  result.user.firstName + " " + result.user.lastName
                }}</strong>
              </td>
              <td scope="col" class="hide-on-sm">
                {{ result.club?.name }}
              </td>
              <td scope="col" class="hide-on-sm">
                {{ result.team?.name }}
              </td>

              <td v-for="n in maxFlights" :key="n" class="no-line-break">
                <RankingClass
                  v-if="result.flights[n - 1]?.flightPoints"
                  :ranking-class="result.flights[n - 1].glider.gliderClass"
                />
                <router-link
                  v-if="result.flights[n - 1]"
                  :to="{
                    name: 'Flight',
                    params: { flightId: result.flights[n - 1].externalId },
                  }"
                >
                  {{ result.flights[n - 1]?.flightPoints }}
                </router-link>
                <div v-else>-</div>
              </td>

              <td>
                <strong>{{ result.totalPoints }} P </strong>({{
                  Math.floor(result.totalDistance)
                }}
                km)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- TODO: Handle this more elegant -->
      <div v-if="!results">Fehler beim laden 🤯</div>
      <div v-if="results?.length === 0">
        Keine Flüge gemeldet in diesem Jahr
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  results: {
    type: Array,
    required: true,
  },
  maxFlights: {
    type: [Number, String],
    required: true,
  },
});
</script>
<style scoped></style>
