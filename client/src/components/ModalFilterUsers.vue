<template>
  <div
    id="userFilterModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="userFilterModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="userFilterModalLabel" class="modal-title">Pilotenfilter</h5>
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
            <BaseInput
              id="filterSelectFirstName"
              v-model="selects.firstName"
              label="Vorname"
              :is-required="false"
              :show-label-on-top="true"
            />
            <BaseInput
              id="filterSelectLastName"
              v-model="selects.lastName"
              label="Vorname"
              :is-required="false"
              :show-label-on-top="true"
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
              id="filterSelectTeam"
              v-model="selects.team"
              label="Team"
              :show-label="true"
              :options="teams"
              :add-empty-option="true"
            />
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
import useFilter from "../composables/useFilter";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const { filterActive, filterDataBy } = useFilter("users");

const selects = reactive({
  firstName: "",
  lastName: "",
  club: "",
  team: "",
});
const filterOptions = (await ApiService.getFilterOptions()).data;
const clubData = filterOptions.clubNames;
const teamData = filterOptions.teamNames;
const clubs = ref(clubData.map((e) => e.name));
const teams = ref(teamData.map((e) => e.name));

const onActivate = async () => {
  // The variable name must match the appropriate query parameter in /flights
  const clubId = findIdByName(selects.club, clubData);
  const teamId = findIdByName(selects.team, teamData);
  const firstNameStartsWith = selects.firstName;
  const lastNameStartsWith = selects.lastName;

  filterDataBy({
    clubId,
    teamId,
    firstNameStartsWith,
    lastNameStartsWith,
  });
};

const anyFilterOptionSet = computed(() =>
  checkIfAnyValueOfObjectIsDefined(selects)
);

watch(filterActive, (newVal, oldVal) => {
  // Clear all fields if an external source caused an reset
  if (!oldVal && newVal) onClear();
});

const onClear = async () => {
  Object.keys(selects).forEach((key) => (selects[key] = ""));
};

function findIdByName(selectObject, initalData) {
  return selectObject
    ? initalData.find((e) => e.name == selectObject).id
    : undefined;
}
</script>
