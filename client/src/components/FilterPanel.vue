<template>
  <div v-if="filterOptions">
    <nav>
      <ul class="nav justify-content-start align-items-start">
        <li class="nav-item">
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
        </li>
        <li v-if="!disableSeasonSelect" class="nav-item me-1 mb-3">
          <SelectSeason :allow-all-seasons="allowAllSeasons" />
        </li>
        <li v-show="showFilterShareButton" class="nav-item">
          <button
            id="shareButton"
            type="button"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Link kopieren"
            class="col btn btn-outline-primary btn-sm mb-3"
            @click="onShareButtonClicked"
          >
            <i class="bi bi-share" data-cy="share-icon"></i>
          </button>
        </li>
      </ul>
    </nav>
    <!-- v-if enforced rerendering of filter badges -->
    <div class="mb-3">
      <span
        v-for="(filter, key) in activeFilters"
        :key="key"
        :data-cy="`filter-badge-${key}`"
        class="badge rounded-pill bg-primary m-1 p-2 position-relative"
      >
        {{ filterDescription(key, filter) }}
        <span
          class="position-absolute top-0 start-100 translate-middle p-0 bg-light rounded-circle"
        >
          <i
            class="bi bi-x clickable text-danger fs-6"
            :data-cy="`filter-clear-one-button`"
            @click="onClearOneFilter(key)"
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
              {{
                userOptions
                  ? "Pilotenfilter"
                  : flightOptions
                    ? "Flugfilter"
                    : "Wertungsfilter"
              }}
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
                id="filterSelectGender"
                v-model="selects.gender"
                label="Geschlecht"
                :show-label="true"
                :options="genders"
                :add-empty-option="true"
              />
              <BaseSelect
                id="filterSelectState"
                v-model="selects.homeStateOfUser"
                label="Heimat-Bundesland"
                :show-label="true"
                :options="states"
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
              <div class="form-check mt-3 mb-3">
                <input
                  id="filterCheckWeekend"
                  v-model="weekend"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="filterCheckWeekend">
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
                <label class="form-check-label" for="filterCheckHikeAndFly">
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
                <!-- Beware: If you associate the user to the normal "value" attribute, this element will cause long loading times in chrome -->
                <option v-for="user in users" :key="user" :data-value="user">
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
              <label for="pilotNameDataList" class="form-label">Name</label>
              <input
                id="pilotNameDataList"
                v-model="selects.user"
                class="form-control mb-3"
                list="datalistPilotNames"
                placeholder="Suchen..."
              />
              <datalist id="datalistPilotNames">
                <!-- Beware: If you associate the user to the normal "value" attribute, this element will cause long loading times in chrome -->
                <option v-for="user in users" :key="user" :data-value="user">
                  {{ user }}
                </option>
              </datalist>
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
              <BaseSelect
                id="filterSelectType"
                v-model="selects.flightType"
                label="Aufgabentyp"
                :show-label="true"
                :options="flightTypes"
                :add-empty-option="true"
              />
              <BaseDatePicker
                id="filterSelectFrom"
                v-model="fromDate"
                label="Von"
                :upper-limit="tillDate"
                :lower-limit="new Date('2004-01-01')"
              />
              <BaseDatePicker
                id="filterSelectTill"
                v-model="tillDate"
                label="Bis"
                :upper-limit="new Date()"
                :lower-limit="fromDate"
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
  </div>
</template>

<script setup>
import useData from "../composables/useData";
import { ref, reactive, computed, onUnmounted, onMounted } from "vue";
import {
  checkIfAnyValueOfObjectIsDefined,
  findKeyByValue,
} from "../helper/utils";
import { FLIGHT_TYPES } from "../common/Constants";
import { format } from "date-fns";
import useSwal from "../composables/useSwal";
import useFilterOptions from "../composables/useFilterOptions";
import { Tooltip } from "bootstrap";

defineProps({
  // TODO: Selecting the modal body like this not effective and not idiot save
  userOptions: {
    type: Boolean,
    default: false,
  },
  flightOptions: {
    type: Boolean,
    default: false,
  },
  disableSeasonSelect: {
    type: Boolean,
    default: false,
  },
  allowAllSeasons: {
    type: Boolean,
    default: false,
  },
});

const {
  filterDataBy,
  isLoading,
  activeFilters,
  clearOneFilter,
  selectedSeason,
} = useData();

const selects = reactive({
  site: "",
  club: "",
  team: "",
  ranking: "",
  region: "",
  gender: "",
  name: "",
  user: "",
  homeStateOfUser: "",
  flightType: "",
});
const weekend = ref(false);
const hikeAndFly = ref(false);
const fromDate = ref(null);
const tillDate = ref(null);

let filterOptions = null;
let siteData = null;
let clubData = null;
let userData = null;
let teamData = null;
let rankingData = null;
let genderData = null;
let statesData = null;
let regions = null;

const users = ref(null);
const teams = ref(null);
const sites = ref(null);
const clubs = ref(null);
const rankings = ref(null);
const genders = ref(null);
const states = ref(null);
const flightTypes = ref(Object.values(FLIGHT_TYPES));

try {
  filterOptions = (await useFilterOptions().get()).value;
  userData = filterOptions.userNames;
  siteData = filterOptions.siteNames;
  clubData = filterOptions.clubNames;
  teamData = filterOptions.teamNames;
  statesData = filterOptions.states;
  rankingData = filterOptions.rankingClasses;
  genderData = filterOptions.genders;
  regions = filterOptions.regions;
  users.value = userData.map((e) => `${e.firstName} ${e.lastName}`);
  teams.value = createTeamFilterOptions(teamData);
  sites.value = siteData.map((e) => e.name);
  clubs.value = clubData.map((e) => e.name);
  states.value = Object.values(statesData).map((e) => e);
  rankings.value = rankingData
    ? Object.values(rankingData).map((e) => e.shortDescription)
    : [];
  genders.value = Object.values(genderData).map((e) => e);
} catch (error) {
  console.log(error);
}

const resetSelectFromKey = (key) => {
  if (key == "siteId") selects.site = "";
  if (key == "clubId") selects.club = "";
  if (key == "rankingClass") selects.ranking = "";
  if (key == "gender") selects.gender = "";
  if (key == "siteRegion") selects.region = "";
  if (key == "homeStateOfUser") selects.homeStateOfUser = "";
  if (key == "teamId") selects.team = "";
  if (key == "flightType") selects.flightType = "";
  if (key == "userId") selects.user = "";
  if (key == "userIds") selects.name = "";

  if (key == "isWeekend") weekend.value = null;
  if (key == "isHikeAndFly") hikeAndFly.value = null;
  if (key == "startDate") fromDate.value = null;
  if (key == "endDate") tillDate.value = null;
};
const selectedFilters = computed(() => {
  return {
    siteId: findIdByName(selects.site, siteData),
    clubId: findIdByName(selects.club, clubData),
    rankingClass: findKeyOfRankingClass(),
    siteRegion: selects.region ? selects.region : undefined,
    isWeekend: weekend.value ? true : undefined,
    isHikeAndFly: hikeAndFly.value ? true : undefined,
    gender: selects.gender ? selects.gender : undefined,
    homeStateOfUser: selects.homeStateOfUser
      ? findKeyByValue(statesData, selects.homeStateOfUser)
      : undefined,
    userIds: findIdsByNameParts(),
    userId: findIdByUserName(),
    teamId: findIdOfTeam(selects.team, teamData),
    flightType: findKeyByValue(FLIGHT_TYPES, selects.flightType),
    startDate: findDate(fromDate.value),
    endDate: findDate(tillDate.value),
  };
});

onMounted(() => {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl);
  });
});
const onActivate = async () => {
  filterDataBy(selectedFilters.value);
};

const findIdByName = (selectObject, initialData) => {
  return selectObject
    ? initialData.find((e) => e.name == selectObject).id
    : undefined;
};

const findIdOfTeam = (selectObject, initialData) => {
  if (!selectObject) return undefined;

  // If no season is selected the value of selectedSeason is an empty string
  // Also the select options have a postfix with the year of the season
  if (!selectedSeason.value) {
    return initialData.find(
      (e) => selectObject.includes(e.name) && selectObject.includes(e.season)
    ).id;
  }

  return initialData.find(
    (e) => e.season == selectedSeason.value && selectObject.includes(e.name)
  ).id;
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
  if (!rankingData) return undefined;

  for (const [key, value] of Object.entries(rankingData)) {
    if (value.shortDescription == selects.ranking) return key;
  }
};

const findDate = (value) => {
  if (!(value instanceof Date)) return undefined;
  return format(value, "yyyy-MM-dd");
};

function createTeamFilterOptions(teamData) {
  if (selectedSeason.value) {
    return teamData
      .filter((t) => t.season == selectedSeason.value)
      .map((e) => e.name);
  }

  // If no season was selected return all teams with a season postfix
  return teamData.map((e) => e.name + ` (${e.season})`);
}

function findIdByUserName() {
  return selects.user
    ? userData.find((e) => `${e.firstName} ${e.lastName}` == selects.user)?.id
    : undefined;
}

const anyFilterOptionSet = computed(
  () =>
    checkIfAnyValueOfObjectIsDefined(selects) ||
    weekend.value ||
    hikeAndFly.value ||
    fromDate.value ||
    tillDate.value
);

// This seems hacky but is better than nothing…
// The whole component could need some refactoring.
const onClearOneFilter = async (key) => {
  await clearOneFilter(key);
  resetSelectFromKey(key);
};

const onClear = () => {
  Object.keys(selects).forEach((key) => (selects[key] = ""));
  weekend.value = false;
  hikeAndFly.value = false;
  fromDate.value = null;
  tillDate.value = null;
};

const showFilterShareButton = computed(
  () => anyFilterOptionSet.value && !!navigator.clipboard
);

const onShareButtonClicked = async () => {
  const { showSuccessToast } = useSwal();

  let baseUrl = window.location.href;
  baseUrl =
    baseUrl.charAt(baseUrl.length - 1) == "/" ? baseUrl.slice(0, -1) : baseUrl;
  const filterString = Object.entries(activeFilters.value)
    .map((f) => f[0] + "=" + f[1])
    .join("&");
  const filterUrl = baseUrl + "?" + filterString;

  try {
    await navigator.clipboard.writeText(filterUrl);
    showSuccessToast("Filter-Link in die Zwischenablage kopiert");
  } catch (error) {
    console.log(error);
  }
};

const filterDescription = (key, filter) => {
  if (key == "siteId") return siteData.find((e) => e.id == filter).name;
  if (key == "clubId") return clubData.find((e) => e.id == filter).name;
  if (key == "rankingClass") return rankingData[filter].shortDescription;
  if (key == "isWeekend") return "Wochenende";
  if (key == "isHikeAndFly") return "Hike & Fly";
  if (key == "gender") return genderDescription(filter);
  if (key == "siteRegion") return filter;
  if (key == "homeStateOfUser") return statesData[filter];
  if (key == "teamId") return teamData.find((e) => e.id == filter).name;
  if (key == "flightType") return FLIGHT_TYPES[filter];
  if (key == "startDate")
    return "Von " + format(new Date(filter), "dd.MM.yyyy");
  if (key == "endDate") return "Bis " + format(new Date(filter), "dd.MM.yyyy");

  // This is inconsistent but currently there is no other way to show the actual search value of "name"
  if (key == "userIds") return selects.name.length > 0 ? selects.name : "Name";
  if (key == "userId")
    return createFullName(userData.find((e) => e.id == filter));
};

const genderDescription = (gender) => {
  if (gender === "M") return "Männlich";
  if (gender === "F") return "Weiblich";
  return "Divers";
};

const createFullName = (user) => user?.firstName + " " + user?.lastName;

onUnmounted(() => onClear());
</script>
