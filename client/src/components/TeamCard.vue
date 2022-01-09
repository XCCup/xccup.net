<template>
  <div class="card-header"></div>
  <div class="card-body row">
    <div class="col-sm-4">
      <div>
        <router-link
          :to="{
            name: 'FlightsAll',
            query: { teamId: team.id, year: route.params.year },
          }"
        >
          <h5 class="card-title cy-team-name-label">
            {{ team.name }}
          </h5>
        </router-link>
      </div>
    </div>
    <div class="col-sm-4 mb-3">
      <div><strong>Mitglieder</strong></div>
      <div v-for="member in team.members" :key="member.id">
        <!-- <RankingClass :ranking-class="createRankingClass(glider)" />{{
              glider.brand
            }} -->
        <router-link
          :to="{
            name: 'FlightsAll',
            query: { userId: member.id, year: route.params.year },
          }"
        >
          {{ member.firstName }} {{ member.lastName }}
        </router-link>
      </div>
    </div>
    <div class="col-sm-4">
      <strong>Statistiken</strong>
      <div>{{ team.stats.flights }} Flüge</div>
      <div>{{ Math.round(team.stats.distance) }} Kilometer</div>
      <div>{{ team.stats.points }} Punkte</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

defineProps({
  team: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
