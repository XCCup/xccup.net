<template>
  <div
    id="resultFilterModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="resultFilterModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="resultFilterModalLabel" class="modal-title">
            Wertungsfilter
          </h5>
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
              id="filterSelectSite"
              v-model="selects.site"
              label="Startplatz"
              :show-label="true"
              :options="sites"
              :add-empty-option="true"
            />
            <BaseSelect
              id="filterSelectClub"
              v-model="selects.club"
              label="Verein"
              :show-label="true"
              :options="clubs"
              :add-empty-option="true"
            />
            <BaseSelect
              id="filterSelectRanking"
              v-model="selects.ranking"
              label="Wertungsklasse"
              :show-label="true"
              :options="rankings"
              :add-empty-option="true"
            />
            <BaseSelect
              id="filterSelectRegion"
              v-model="selects.region"
              label="Region*"
              :show-label="true"
              :options="regions"
              :add-empty-option="true"
            />
            <BaseSelect
              id="filterSelectGender"
              v-model="selects.gender"
              label="Geschlecht"
              :show-label="true"
              :options="genders"
              :add-empty-option="true"
            />
            <div class="form-check mt-3 mb-3">
              <input
                id="filterCheckWeekend"
                v-model="weekend"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="flexCheckNewsletter">
                Wochenende und Feiertage*
              </label>
            </div>
            <div class="form-check mb-3">
              <input
                id="filterCheckHikeAndFly"
                v-model="hikeAndFly"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="flexCheckNewsletter">
                Hike & Fly*
              </label>
            </div>
            <p>* Hierbei handelt es sich um experimentelle Optionen</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="anyFilterOptionSet"
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

import { ref, reactive, watch, computed } from "vue";
import useData from "../composables/useData";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const { filterActive, filterDataBy } = useData(ApiService.getResults);

const selects = reactive({
  site: "",
  club: "",
  team: "",
  ranking: "",
  region: "",
  gender: "",
});
const filterOptions = (await ApiService.getFilterOptions()).data;
const siteData = filterOptions.siteNames;
const clubData = filterOptions.clubNames;
const teamData = filterOptions.teamNames;
const rankingData = filterOptions.rankingClasses;
const regions = filterOptions.regions;
const genderData = filterOptions.genders;
const sites = ref(siteData.map((e) => e.name));
const clubs = ref(clubData.map((e) => e.name));
const rankings = ref(Object.values(rankingData).map((e) => e.shortDescription));
const genders = ref(Object.values(genderData).map((e) => e));
const weekend = ref(false);
const hikeAndFly = ref(false);

const onActivate = async () => {
  // The variable name must match the appropriate query parameter in /results
  const siteId = findIdByName(selects.site, siteData);
  const clubId = findIdByName(selects.club, clubData);
  const rankingClass = findKeyOfRankingClass(selects.team, teamData);
  const gender = selects.gender ? selects.gender : undefined;
  const region = selects.region ? selects.region : undefined;
  const isWeekend = weekend.value ? true : undefined;
  const isHikeAndFly = hikeAndFly.value ? true : undefined;

  filterDataBy({
    siteId,
    clubId,
    rankingClass,
    region,
    isWeekend,
    isHikeAndFly,
    gender,
  });
};

watch(filterActive, (newVal, oldVal) => {
  // Clear all fields if an external source caused an reset
  if (!oldVal && newVal) onClear();
});

const anyFilterOptionSet = computed(() =>
  checkIfAnyValueOfObjectIsDefined(selects)
);

const onClear = () => {
  Object.keys(selects).forEach((key) => (selects[key] = ""));
  weekend.value = false;
  hikeAndFly.value = false;
};

function findIdByName(selectObject, initalData) {
  return selectObject
    ? initalData.find((e) => e.name == selectObject).id
    : undefined;
}
function findKeyOfRankingClass() {
  for (const [key, value] of Object.entries(rankingData)) {
    if (value.shortDescription == selects.ranking) return key;
  }
}
</script>
