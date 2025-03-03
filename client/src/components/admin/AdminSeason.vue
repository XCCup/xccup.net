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
          <p v-if="isActiveSeason" class="text-danger">
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
          :lower-limit="new Date()"
          :disabled="isActiveSeason"
        />
        <BaseDatePicker
          :key="endDate.toDateString()"
          v-model="endDate"
          label="Saisonende"
          data-cy="seasonEndDataPicker"
          :lower-limit="startDate"
          :disabled="isActiveSeason"
        />
        <div class="form-check mb-3">
          <input
            id="checkPauseSeason"
            v-model="season.isPaused"
            class="form-check-input"
            data-cy="saisonPauseCheckbox"
            type="checkbox"
            value
          />
          <div>
            <label class="form-check-label" for="checkPauseSeason">
              Saison pausieren
            </label>
          </div>
        </div>
        <BaseInput
          v-model="season.pointThresholdForFlight"
          label="Punkteschwelle Wertungsflug"
          :disabled="isActiveSeason"
        />
        <BaseInput
          v-model="season.numberOfFlightsForShirt"
          label="Flüge für T-Shirt"
          :disabled="isActiveSeason"
        />
        <BaseInput
          v-model="season.seniorStartAge"
          label="Start Seniorenwertung (Alter)"
          :disabled="isActiveSeason"
        />
        <BaseInput
          v-model="season.seniorBonusPerAge"
          label="Bonus Seniorenwertung (%)"
          :disabled="isActiveSeason"
        />
        <BaseTextarea
          v-model="plainFlightTypeFactors"
          label="Flugfaktoren"
          :disabled="isActiveSeason"
        />
        <BaseTextarea
          v-model="plainGliderClasses"
          label="Klassenfaktoren"
          :disabled="isActiveSeason"
        />
        <BaseTextarea
          v-model="plainRankingClasses"
          label="Wertungsklassen"
          :disabled="isActiveSeason"
        />
        <button
          type="submit"
          class="btn btn-outline-primary"
          data-cy="submitSeasonButton"
          @click="onCreateEditSeason"
        >
          {{ isUpdate ? "Saison updaten" : "Neue Saison anlegen" }}
          <BaseSpinner v-if="showSpinner" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SeasonDetail } from "@/types/SeasonDetail";
import { format } from "date-fns";
import { cloneDeep } from "lodash-es";
import { computed, ref, watch } from "vue";
import useSwal from "../../composables/useSwal";
import ApiService from "../../services/ApiService";

const { showSuccessToast, showFailedToast } = useSwal();

const showSpinner = ref(false);

const isActiveSeason = computed(() => {
  const now = new Date();
  // No season defined at all
  if (!latestSeason.value) return false;
  const startLatestSeason = new Date(latestSeason?.value.startDate);
  const endLatestSeason = new Date(latestSeason?.value.endDate);

  if (
    now.getTime() >= startLatestSeason.getTime() &&
    now.getTime() < endLatestSeason.getTime()
  )
    return true;

  return false;
});

const nextSeasonAlreadyDefined = computed(() => {
  if (!latestSeason.value) return false;

  const yearOfLatestSeason = new Date(
    latestSeason?.value.startDate
  ).getFullYear();

  return yearOfLatestSeason == new Date().getFullYear();
});

const isUpdate = computed(() => {
  return (
    (isActiveSeason || nextSeasonAlreadyDefined) && !isAfterSeasonEnd.value
  );
});

const latestSeason = ref<SeasonDetail | null>(null);
const season = ref<SeasonDetail>(createDefaultSeasonObject());
const isAfterSeasonStart = ref(false);
const isAfterSeasonEnd = ref(false);
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
  try {
    prepareSeasonDataForRequest();
  } catch (error) {
    // Just terminate call here
    return;
  }
  try {
    showSpinner.value = true;
    if (isUpdate.value && seasonId) {
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

function parseJsonTextareas(value: string, fieldName: string) {
  try {
    return JSON.parse(value);
  } catch (error) {
    showFailedToast(`JSON in ${fieldName} ist invalide`);
    throw error;
  }
}

function prepareSeasonDataForRequest() {
  season.value.flightTypeFactors = parseJsonTextareas(
    plainFlightTypeFactors.value,
    "Flugfaktoren"
  );
  season.value.gliderClasses = parseJsonTextareas(
    plainGliderClasses.value,
    "Klassenfaktoren"
  );
  season.value.rankingClasses = parseJsonTextareas(
    plainRankingClasses.value,
    "Wertungsklassen"
  );

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

    noSeasonDefined.value = season.value == null;

    startDate.value = new Date(season.value?.startDate);
    endDate.value = new Date(season.value?.endDate);
    const now = new Date().getTime();
    const start = startDate.value.getTime();
    const end = endDate.value.getTime();

    isAfterSeasonStart.value = now > start;
    isAfterSeasonEnd.value = now > end;

    plainFlightTypeFactors.value = stringify(season.value.flightTypeFactors);
    plainGliderClasses.value = stringify(season.value.gliderClasses);
    plainRankingClasses.value = stringify(season.value.rankingClasses);
  } catch (error) {
    console.error();
  }
}
</script>
