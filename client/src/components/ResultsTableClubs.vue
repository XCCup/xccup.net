<template>
  <section class="pb-3">
    <div v-if="results?.values?.length > 0" class="table-responsive">
      <table class="table table-striped table-hover text-sm">
        <thead>
          <th></th>
          <th>Verein</th>
          <th>Punkte</th>
          <th>Pilot</th>
          <th
            v-for="n in results.constants.NUMBER_OF_SCORED_FLIGHTS"
            :key="n"
            class="no-line-break"
          >
            Flug {{ n }}
          </th>
          <th class="hide-on-sm">Gesamt</th>
        </thead>
        <tbody>
          <tr v-for="(club, index) in results.values" :key="club.clubId">
            <td>{{ index + 1 }}</td>

            <td>
              <strong>{{ club.clubName }}</strong>
            </td>
            <td>
              <tr class="no-line-break">
                {{
                  club.totalPoints
                }}
                P
              </tr>
              <tr class="no-line-break">
                ({{
                  Math.floor(club.totalDistance)
                }}
                km)
              </tr>
            </td>

            <td>
              <tr v-for="member in club.members" :key="member.id">
                <td class="no-line-break">
                  {{ member.firstName + " " + member.lastName }}
                </td>
              </tr>
            </td>
            <td
              v-for="n in results.constants.NUMBER_OF_SCORED_FLIGHTS"
              :key="n"
            >
              <tr v-for="member in club.members" :key="member.id">
                <td v-if="member.flights[n - 1]" class="no-line-break">
                  <RankingClass
                    :ranking-class="
                      member.flights[n - 1].glider?.gliderClass ?? {}
                    "
                  />
                  <router-link
                    :to="{
                      name: 'Flight',
                      params: {
                        flightId: member.flights[n - 1].externalId,
                      },
                    }"
                    ><span
                      v-if="member.flights[n - 1].isDismissed"
                      class="text-decoration-line-through fst-italic"
                      >{{ member.flights[n - 1].flightPoints }}</span
                    >
                    <span v-else>{{ member.flights[n - 1].flightPoints }}</span>
                  </router-link>
                </td>
                <td v-else>-</td>
              </tr>
            </td>
            <td class="hide-on-sm">
              <tr v-for="member in club.members" :key="member.id">
                <td>
                  <strong class="no-line-break">
                    {{ member.totalPoints }} P
                  </strong>
                  <span class="no-line-break">
                    ({{ Math.floor(member.totalDistance) }}
                    km)
                  </span>
                </td>
              </tr>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- TODO: Handle this more elegant -->
    <div v-if="!results">Fehler beim laden 🤯</div>

    <div v-if="results?.values?.length === 0 && !results.noDataFlag">
      Keine Flüge gemeldet in diesem Jahr
    </div>
    <div v-if="results.noDataFlag">
      Keine Wertung für dieses Jahr vorhanden.
    </div>
  </section>
</template>

<script setup>
defineProps({
  results: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped></style>
