<template>
  <button
    id="filterButton"
    type="button"
    class="col btn btn-outline-primary btn-sm me-1 mb-3"
    data-bs-toggle="modal"
    data-bs-target="#filterModal"
  >
    Filter
    <!-- TODO: Move spinner elsewhere= -->
    <!-- Beware e.g. sorting in flights all table. Table should not disapper or change position -->
    <BaseSpinner v-if="isLoading" />
    <i v-else class="bi bi-funnel" data-cy="filter-icon"></i>
  </button>

  <div class="mb-3">
    <span
      v-for="(filter, key) in activeFilters"
      :key="key"
      :data-cy="`filter-badge-${key}`"
      class="badge rounded-pill bg-primary mx-1 p-2 position-relative"
    >
      {{ filterDescription(key, filter) }}
      <span
        class="position-absolute top-0 start-100 translate-middle p-0 bg-light rounded-circle"
      >
        <i
          class="bi bi-x clickable text-danger fs-6"
          :data-cy="`filter-clear-one-button`"
          @click="clearOneFilter(key)"
        ></i>
      </span>
    </span>
  </div>
  <!-- Modal -->
  <div
    id="filterModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="resultFilterModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="resultFilterModalLabel" class="modal-title">
            {{ userOptions ? "Pilotenfilter" : "Wertungsfilter" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <!-- TODO: This is a temporary solution. -->
        <!-- Results -->
        <div v-if="!userOptions && !flightOptions" class="modal-body">
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
        <!-- User Modal -->
        <div v-if="userOptions" class="modal-body">
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
        <!-- Flights -->
        <div v-if="flightOptions" class="modal-body">
          <div class="mb-3">
            <BaseSelect
              id="filterSelectName"
              v-model="selects.user"
              label="Name"
              :show-label="true"
              :options="users"
              :add-empty-option="true"
            />
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
              id="filterSelectTeam"
              v-model="selects.team"
              label="Team"
              :show-label="true"
              :options="teams"
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
            data-cy="activate-filter-button"
            @click="onActivate"
          >
            Anwenden
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            <div>Abbrechen</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useData from "../composables/useData";
import ApiService from "@/services/ApiService.js";
import { ref, reactive, watch, computed, onUnmounted } from "vue";
import { checkIfAnyValueOfObjectIsDefined } from "../helper/utils";

const props = defineProps({
  apiEndpoint: {
    type: Function,
    required: true,
  },
  // TODO: Selecting the modal body like this not effective and not idiot save
  userOptions: {
    type: Boolean,
    default: false,
  },
  flightOptions: {
    type: Boolean,
    default: false,
  },
});

const { filterDataBy, filterActive, isLoading, activeFilters, clearOneFilter } =
  useData(props.apiEndpoint);

const selects = reactive({
  site: "",
  club: "",
  team: "",
  ranking: "",
  region: "",
  gender: "",
  name: "",
  user: "",
});
const weekend = ref(false);
const hikeAndFly = ref(false);

let filterOptions = null;
try {
  const res = await ApiService.getFilterOptions();
  filterOptions = res.data;
} catch (error) {
  console.log(error);
}
const userData = filterOptions.userNames;

const siteData = filterOptions.siteNames;
const clubData = filterOptions.clubNames;
const teamData = filterOptions.teamNames;
const rankingData = filterOptions.rankingClasses;
const genderData = filterOptions.genders;
const regions = filterOptions.regions;

const users = ref(userData.map((e) => `${e.firstName} ${e.lastName}`));
const teams = ref(teamData.map((e) => e.name));
const sites = ref(siteData.map((e) => e.name));
const clubs = ref(clubData.map((e) => e.name));
const rankings = ref(Object.values(rankingData).map((e) => e.shortDescription));
const genders = ref(Object.values(genderData).map((e) => e));

const selectedFilters = computed(() => {
  return {
    siteId: findIdByName(selects.site, siteData),
    clubId: findIdByName(selects.club, clubData),
    rankingClass: findKeyOfRankingClass(selects.team, teamData),
    // Is the 'ö' in Rhön save?
    region: selects.region ? selects.region : undefined,
    isWeekend: hikeAndFly.value ? true : undefined,
    isHikeAndFly: hikeAndFly.value ? true : undefined,
    gender: selects.gender ? selects.gender : undefined,
    userIds: findIdsByNameParts(),
    userId: findIdByUserName(),

    teamId: findIdByName(selects.team, teamData),
  };
});

const onActivate = async () => {
  filterDataBy(selectedFilters.value);
};

watch(filterActive, (newVal, oldVal) => {
  // Clear all fields if an external source caused an reset
  // TODO: Sometimes this clears without known reason
  if (!oldVal && newVal) onClear();
});

const findIdByName = (selectObject, initalData) => {
  return selectObject
    ? initalData.find((e) => e.name == selectObject).id
    : undefined;
};

const findIdsByNameParts = () => {
  // Return undefined if no value was present
  if (!selects.name.length) return;

  const possibleUsers = userData.filter(
    (u) =>
      u.firstName.toLowerCase().includes(selects.name.toLowerCase()) ||
      u.lastName.toLowerCase().includes(selects.name.toLowerCase()) ||
      (u.firstName.toLowerCase() + " " + u.lastName.toLowerCase()).includes(
        selects.name.toLowerCase()
      )
  );
  return possibleUsers.map((u) => u.id);
};

const findKeyOfRankingClass = () => {
  for (const [key, value] of Object.entries(rankingData)) {
    if (value.shortDescription == selects.ranking) return key;
  }
};

function findIdByUserName() {
  return selects.user
    ? userData.find((e) => `${e.firstName} ${e.lastName}` == selects.user).id
    : undefined;
}

const anyFilterOptionSet = computed(() =>
  checkIfAnyValueOfObjectIsDefined(selects)
);

const onClear = () => {
  Object.keys(selects).forEach((key) => (selects[key] = ""));
  weekend.value = false;
  hikeAndFly.value = false;
};

const filterDescription = (key, filter) => {
  if (key == "siteId") return siteData.find((e) => e.id == filter).name;
  if (key == "clubId") return clubData.find((e) => e.id == filter).name;
  if (key == "rankingClass") return rankingData[filter].shortDescription;
  if (key == "isWeekend") return "Wochenende";
  if (key == "isHikeAndFly") return "Hike & Fly";
  if (key == "gender") return genderDescription(filter);
  if (key == "region") return filter;
  if (key == "teamId") return teamData.find((e) => e.id == filter).name;

  // This is inconsistent but currently there is no other way to show the actual search value of "name"
  if (key == "userIds") return selects.name.length > 0 ? selects.name : "Name";
  if (key == "userId")
    return createFullName(userData.find((e) => e.id == filter));
};

const genderDescription = (gender) => {
  if (gender === "M") return "Männlich";
  if (gender === "W") return "Weiblich";
  return "Divers";
};

const createFullName = (user) => user.firstName + " " + user.lastName;

onUnmounted(() => onClear());
</script>
