<template>
  <section class="pb-3">
    <div v-if="results?.length > 0 && maxFlights" class="table-responsive">
      <table class="table table-striped table-hover text-sm">
        <thead>
          <tr>
            <th>Platz</th>
            <th
              class="hide-on-sm"
              title="Platz- und Punkte-Veränderung seit dem letzten relevanten Ereignis, maximal 7 Tage sichtbar"
            >
              7-Tage-Trend
            </th>

            <th>Name</th>
            <th scope="col" class="hide-on-sm">Verein</th>
            <th scope="col" class="hide-on-sm">Team</th>

            <th v-for="n in maxFlights" :key="n" class="no-line-break">
              #{{ n }}
            </th>

            <th>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="result.user.id">
            <td>{{ index + 1 }}</td>
            <td class="hide-on-sm no-line-break">
              <span
                v-if="result.rankChange > 0"
                class="text-success"
                :title="`${result.rankChange} Platz${result.rankChange === 1 ? '' : 'e'} nach oben`"
              >
                <i class="bi bi-caret-up-fill"></i>{{ result.rankChange }}
              </span>
              <span
                v-else-if="result.rankChange < 0"
                class="text-danger"
                :title="`${Math.abs(result.rankChange)} Platz${Math.abs(result.rankChange) === 1 ? '' : 'e'} nach unten`"
              >
                <i class="bi bi-caret-down-fill"></i>{{ Math.abs(result.rankChange) }}
              </span>
              <span v-else class="text-muted">–</span>

              <span
                v-if="result.lastPointGain > 0"
                class="badge bg-success ms-1"
                title="Letzter Punktgewinn"
              >
                +{{ result.lastPointGain }} P
              </span>
            </td>
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
                :ranking-class="result.flights[n - 1].glider?.gliderClass ?? {}"
              />
              <router-link
                v-if="result.flights[n - 1]"
                :class="{
                  'fw-bold': result.flights[n - 1].isLatestSubmission,
                }"
                :title="
                  result.flights[n - 1].isLatestSubmission
                    ? 'Zuletzt eingereichter Flug'
                    : undefined
                "
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
    <div v-if="results?.length === 0 && !noDataFlag">
      Keine Flüge gemeldet in diesem Jahr
    </div>
    <div v-if="noDataFlag" data-cy="no-data">
      Keine Wertung für dieses Jahr vorhanden.
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
    type: Number,
    required: true,
  },
  noDataFlag: {
    type: Boolean,
    default: false,
  },
});
</script>
<style scoped></style>
