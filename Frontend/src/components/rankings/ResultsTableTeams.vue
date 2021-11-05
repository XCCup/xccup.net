<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="results?.values?.length > 0" class="table-responsive">
        <div class="remarks">
          <p>
            Hinweis: Die schlechtesten
            {{ results.constants.TEAM_DISMISSES }} Ergebnisse eines Teams werden
            gelöscht
          </p>
        </div>
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Platz</th>
            <th>Team</th>
            <th>Punkte / Strecke</th>
            <th>Pilot</th>
            <th
              v-for="n in results.constants.NUMBER_OF_SCORED_FLIGHTS"
              :key="n"
            >
              Flug {{ n }}
            </th>
            <th>Gesamt</th>
          </thead>
          <tbody>
            <tr
              v-for="(team, index) in results.values"
              v-bind:key="team.teamId"
            >
              <td>{{ index + 1 }}</td>

              <td>
                <strong>{{ team.teamName }}</strong>
              </td>
              <td>
                {{ team.totalPoints }} P ({{ Math.floor(team.totalDistance) }}
                km)
              </td>

              <td>
                <tr v-for="member in team.members" v-bind:key="member.id">
                  <td>{{ member.firstName + " " + member.lastName }}</td>
                </tr>
              </td>
              <td
                v-for="n in results.constants.NUMBER_OF_SCORED_FLIGHTS"
                v-bind:key="n"
              >
                <tr v-for="member in team.members" v-bind:key="member.id">
                  <td v-if="member.flights[n - 1]">
                    <i
                      class="bi bi-trophy me-1"
                      :class="member.flights[n - 1].glider.gliderClass.key"
                    ></i>
                    <router-link
                      :to="{
                        name: 'Flight',
                        params: { flightId: member.flights[n - 1].externalId },
                      }"
                      >{{ member.flights[n - 1].flightPoints }}
                    </router-link>
                  </td>
                  <td v-else>-</td>
                </tr>
              </td>
              <td>
                <tr v-for="member in team.members" v-bind:key="member.id">
                  <td>
                    <strong>{{ member.totalPoints }} P </strong>({{
                      Math.floor(member.totalDistance)
                    }}
                    km)
                  </td>
                </tr>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- TODO: Handle this more elegant -->
      <div v-if="!results">Fehler beim laden 🤯</div>
      <div v-if="results?.values?.length === 0">
        Keine Flüge gemeldet in diesem Jahr
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  results: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped></style>
