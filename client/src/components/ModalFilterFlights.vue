<template>
  <div
    id="flightFilterModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="flightFilterModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="flightFilterModalLabel" class="modal-title">Flugfilter</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="onClose"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <BaseSelect
              v-model="selects.user"
              label="Name"
              :show-label="true"
              :options="users"
            />
            <BaseSelect
              v-model="selects.site"
              label="Startplatz"
              :show-label="true"
              :options="sites"
            />
            <BaseSelect
              v-model="selects.club"
              label="Verein"
              :show-label="true"
              :options="clubs"
            />
            <BaseSelect
              v-model="selects.team"
              label="Team"
              :show-label="true"
              :options="teams"
            />
            <BaseSelect
              v-model="selects.ranking"
              label="Wertungsklasse"
              :show-label="true"
              :options="rankings"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-primary me-auto"
            @click="onClear"
          >
            Löschen
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="onActivate"
          >
            Anwenden
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
            @click="onClose"
          >
            <div>Abbrechen</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";

import { ref, reactive, watch } from "vue";
import useFlights from "@/composables/useFlights";

const { filterFlightsBy, filterActive } = useFlights();

const selects = reactive({
  user: "",
  site: "",
  club: "",
  team: "",
  ranking: "",
});
const userData = (await ApiService.getUserNames()).data;
const siteData = (await ApiService.getSiteNames()).data;
const clubData = (await ApiService.getClubNames()).data;
const teamData = (await ApiService.getTeamNames()).data;
const rankingData = (await ApiService.getRankingClasses()).data;
const users = ref(userData.map((e) => `${e.firstName} ${e.lastName}`));
const sites = ref(siteData.map((e) => e.name));
const clubs = ref(clubData.map((e) => e.name));
const teams = ref(teamData.map((e) => e.name));
const rankings = ref(Object.values(rankingData).map((e) => e.shortDescription));

const onClose = () => {
  //Needed?
};

const onActivate = async () => {
  // The variable name must match the appropriate query parameter in /flights
  const userId = findIdByUserName();
  const siteId = findIdByName(selects.site, siteData);
  const clubId = findIdByName(selects.club, clubData);
  const teamId = findIdByName(selects.team, teamData);
  const rankingClass = findKeyOfRankingClass(selects.team, teamData);

  filterFlightsBy({ userId, siteId, clubId, teamId, rankingClass });
};

watch(filterActive, (newVal, oldVal) => {
  // Clear all fields if an external source caused an reset
  if (!oldVal && newVal) onClear();
});

const onClear = async () => {
  //Should the modal close after clear?
  Object.keys(selects).forEach((key) => (selects[key] = ""));
};

function findIdByName(selectObject, initalData) {
  return selectObject
    ? initalData.find((e) => e.name == selectObject).id
    : undefined;
}
function findIdByUserName() {
  return selects.user
    ? userData.find((e) => `${e.firstName} ${e.lastName}` == selects.user).id
    : undefined;
}
function findKeyOfRankingClass() {
  for (const [key, value] of Object.entries(rankingData)) {
    if (value.shortDescription == selects.ranking) return key;
  }
}
</script>
