<template>
  <div id="adminSeasonPanel" class="container pb-3">
    <div class="col-6 col">
      <div>
        <h5>Saisonkontrolle</h5>
        <div data-cy="remarksParagraph">
          <p v-if="!isAfterSeasonStart">
            Saison ist noch nicht gestartet. Du kannst alles ändern. Bitte achte
            darauf, dass die Ausschreibung korrekt angepasst wird.
          </p>
          <p v-if="isBetweenSeasons" class="text-danger">
            Saison ist aktiv. Du kannst nur wenige Änderungen vornehmen.
          </p>
          <p v-if="isAfterSeasonEnd && isAfterSeasonStart">
            Saison ist abgeschlossen. Du kannst eine neue Saison für das nächste
            Jahr anlegen.
          </p>
        </div>
        <BaseDatePicker
          :key="startDate.toDateString()"
          v-model="startDate"
          label="Saisonstart"
          data-cy="seasonStartDataPicker"
          :lower-limit="
            isAfterSeasonEnd
              ? new Date(new Date().getFullYear() + 1, 0)
              : new Date()
          "
          :is-disabled="isBetweenSeasons"
        />
        <BaseDatePicker
          :key="endDate.toDateString()"
          v-model="endDate"
          label="Saisonende"
          data-cy="seasonEndDataPicker"
          :lower-limit="startDate"
          :is-disabled="isBetweenSeasons"
        />
        <div class="form-check mb-3">
          <input
            v-model="season.isPaused"
            class="form-check-input"
            data-cy="saisonPauseCheckbox"
            type="checkbox"
            value
          />
          <div>
            <label class="form-check-label" for="flexCheckDefault">
              Saison pausieren
            </label>
          </div>
        </div>
        <BaseInput
          v-model="season.pointThresholdForFlight"
          label="Punkteschwelle Wertungsflug"
          :is-disabled="isBetweenSeasons"
        />
        <BaseInput
          v-model="season.numberOfFlightsForShirt"
          label="Flüge für T-Shirt"
          :is-disabled="isBetweenSeasons"
        />
        <BaseInput
          v-model="season.seniorStartAge"
          label="Start Seniorenwertung (Alter)"
          :is-disabled="isBetweenSeasons"
        />
        <BaseInput
          v-model="season.seniorBonusPerAge"
          label="Bonus Seniorenwertung (%)"
          :is-disabled="isBetweenSeasons"
        />
        <BaseTextarea
          v-model="plainFlightTypeFactors"
          label="Flugfaktoren"
          :is-disabled="isBetweenSeasons"
        />
        <BaseTextarea
          v-model="plainGliderClasses"
          label="Klassenfaktoren"
          :is-disabled="isBetweenSeasons"
        />
        <BaseTextarea
          v-model="plainRankingClasses"
          label="Wertungsklassen"
          :is-disabled="isBetweenSeasons"
        />
        <p>Klassen und Faktoren werden von der aktuellen Wertung übernommen</p>

        <button
          type="submit"
          class="btn btn-outline-primary"
          :disabled="disableSubmit"
          @click="onCreateEditSeason"
        >
          <span v-if="isBetweenSeasons || seasonForNextYearAlreadyDefined"
            >Saison updaten</span
          >
          <span v-else>Neue Saison anlegen</span>
          <BaseSpinner v-if="showSpinner" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SeasonDetail } from "@/types/SeasonDetail";
import { format } from "date-fns";
import { cloneDeep } from "lodash";
import { computed, ref, watch } from "vue";
import useSwal from "../../composables/useSwal";
import ApiService from "../../services/ApiService";

const { showSuccessToast, showFailedToast } = useSwal();

const showSpinner = ref(false);

const disableSubmit = computed(() => {
  const res =
    isAfterSeasonEnd.value &&
    startDate.value.getFullYear() == new Date().getFullYear();
  return res;
});
const seasonForNextYearAlreadyDefined = computed(() => {
  const yearOfLatestSeason = latestSeason?.value
    ? new Date(latestSeason?.value.startDate).getFullYear()
    : new Date().getFullYear();

  return (
    !isAfterSeasonStart.value && yearOfLatestSeason > new Date().getFullYear()
  );
});

const latestSeason = ref<SeasonDetail | null>(null);
const season = ref<SeasonDetail>(createDefaultSeasonObject());
const isAfterSeasonStart = ref(false);
const isAfterSeasonEnd = ref(false);
const isBetweenSeasons = ref(false);
const noSeasonDefined = ref(false);

const plainFlightTypeFactors = ref("");
const plainGliderClasses = ref("");
const plainRankingClasses = ref("");
const startDate = ref(new Date());
const endDate = ref(new Date());

await retrieveCurrentSeason();

//

// Auto update endTime if it is before startTime
watch(startDate, () => {
  if (startDate.value.getTime() > endDate.value.getTime()) {
    endDate.value = new Date(startDate.value);
  }
});

async function onCreateEditSeason() {
  const seasonId = season.value.id;
  prepareSeasonDataForRequest();
  try {
    showSpinner.value = true;
    if (
      (isBetweenSeasons.value || seasonForNextYearAlreadyDefined.value) &&
      seasonId
    ) {
      await ApiService.updateSeason(seasonId, season.value);
    } else {
      await ApiService.createNewSeason(season.value);
    }
    showSuccessToast();
  } catch (error) {
    showFailedToast();
    console.error();
  } finally {
    showSpinner.value = false;
    retrieveCurrentSeason();
  }
}

function stringify(object: Object) {
  return JSON.stringify(object, null, 2);
}

function prepareSeasonDataForRequest() {
  season.value.flightTypeFactors = JSON.parse(plainFlightTypeFactors.value);
  season.value.gliderClasses = JSON.parse(plainGliderClasses.value);
  season.value.rankingClasses = JSON.parse(plainRankingClasses.value);

  season.value.startDate = format(startDate.value, "yyyy-MM-dd");
  season.value.endDate = format(endDate.value, "yyyy-MM-dd");

  season.value.year = startDate.value.getFullYear();

  delete season.value.createdAt;
  delete season.value.updatedAt;
  delete season.value.id;
}

function createDefaultSeasonObject() {
  return {
    year: new Date().getFullYear(),
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isPaused: false,
    pointThresholdForFlight: 60,
    numberOfFlightsForShirt: 2,
    gliderClasses: {},
    flightTypeFactors: {
      FAI: 2,
      FLAT: 1.5,
      FREE: 1,
    },
    rankingClasses: {},
    seniorStartAge: 60,
    seniorBonusPerAge: 2,
    activeRankings: {},
    misc: {},
  };
}

async function retrieveCurrentSeason() {
  try {
    const res = await ApiService.getLatestSeason();
    latestSeason.value = res.data;

    // Copy retrieved season otherwise use default season object
    if (latestSeason.value) season.value = cloneDeep(latestSeason.value);

    console.log("Current season: ", season.value);

    noSeasonDefined.value = season.value == null;

    startDate.value = new Date(season.value?.startDate);
    endDate.value = new Date(season.value?.endDate);
    const now = new Date().getTime();
    const start = startDate.value.getTime();
    const end = endDate.value.getTime();

    console.log("N: ", now);
    console.log("S: ", start);
    console.log("E: ", end);

    isAfterSeasonStart.value = now > start;
    isAfterSeasonEnd.value = now > end;
    isBetweenSeasons.value =
      isAfterSeasonStart.value && !isAfterSeasonEnd.value;

    plainFlightTypeFactors.value = stringify(season.value.flightTypeFactors);
    plainGliderClasses.value = stringify(season.value.gliderClasses);
    plainRankingClasses.value = stringify(season.value.rankingClasses);
  } catch (error) {
    console.error();
  }
}
</script>
