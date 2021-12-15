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
            <label for="userDataList" class="form-label">Name</label>
            <input
              id="filterSelectName"
              v-model="selects.name"
              class="form-control mb-3"
              list="datalistOptions"
              placeholder="Suchen..."
            />
            <datalist id="datalistOptions">
              <option v-for="user in users" :key="user" :value="user">
                {{ user }}
              </option>
            </datalist>

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
import useData from "../composables/useData";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const { filterActive, filterDataBy } = useData(ApiService.getUsers);

const selects = reactive({
  name: "",
  club: "",
  team: "",
});
const filterOptions = (await ApiService.getFilterOptions()).data;
const userData = filterOptions.userNames;
const clubData = filterOptions.clubNames;
const teamData = filterOptions.teamNames;
const users = ref(userData.map((e) => `${e.firstName} ${e.lastName}`));
const clubs = ref(clubData.map((e) => e.name));
const teams = ref(teamData.map((e) => e.name));

const onActivate = async () => {
  // The variable name must match the appropriate query parameter in /flights
  const clubId = findIdByName(selects.club, clubData);
  const teamId = findIdByName(selects.team, teamData);
  const userIds = findIdsByNameParts();

  filterDataBy({
    clubId,
    teamId,
    userIds,
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
function findIdsByNameParts() {
  // Return undefined if no value was present
  if (!selects.name.length) return;

  const possibleUsers = userData.filter(
    (u) =>
      u.firstName.toLowerCase().includes(selects.name.toLowerCase()) ||
      u.lastName.toLowerCase().includes(selects.name.toLowerCase()) ||
      (selects.name.toLowerCase().includes(u.firstName.toLowerCase()) &&
        selects.name.toLowerCase().includes(u.lastName.toLowerCase()))
  );
  return possibleUsers.map((u) => u.id);
}
</script>
