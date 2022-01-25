<template>
  <div v-if="listOfCountries" class="p-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="text-right">Profil</h4>
    </div>
    <div class="row mt-2">
      <div class="col-md-6">
        <BaseInput
          id="firstName"
          v-model="modifiedUserData.firstName"
          label="Name"
        />
      </div>
      <div class="col-md-6">
        <BaseInput
          id="lastName"
          v-model="modifiedUserData.lastName"
          label="Nachname"
        />
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-md-12">
        <BaseSelect
          id="club"
          v-model="modifiedUserData.club.name"
          label="Verein*"
          :show-label="true"
          :options="listOfClubs"
          :is-disabled="!isClubChangeable"
        />
        <BaseInput
          id="street"
          v-model="modifiedUserData.address.street"
          label="Strasse"
        />
        <div class="row">
          <div class="col-md-6">
            <BaseInput
              id="zip"
              v-model="modifiedUserData.address.zip"
              :is-required="false"
              label="PLZ"
            />
          </div>
          <div class="col-md-6">
            <BaseInput
              id="city"
              v-model="modifiedUserData.address.city"
              :is-required="false"
              label="Stadt"
            />
          </div>
        </div>
        <div class="row mb-4">
          <!-- State -->
          <div class="col-md-6">
            <BaseSelect
              id="state"
              v-model="modifiedUserData.address.state"
              label="Bundesland"
              :show-label="true"
              :options="listOfStates"
              :disabled="!stateListIsEnabled"
            />
          </div>
          <div class="col-md-6">
            <!-- Country -->
            <BaseSelect
              id="country"
              v-model="modifiedUserData.address.country"
              label="Land"
              :show-label="true"
              :options="listOfCountries"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <BaseSelect
              id="gender"
              v-model="modifiedUserData.gender"
              label="Geschlecht"
              :show-label="true"
              :options="listOfGenders"
            />
          </div>
          <!-- Don't erase the :key; This is a hack to enfore new rendering on the component if the value changes;
          In this particular circumstance the vue reactivity system doesn't regcognize the change in birthday after the fetch.-->
          <div :key="modifiedUserData.birthday" class="col-md-6">
            <!-- TODO: Replace with three seperate selects -->
            <BaseDatePicker
              id="birthday"
              v-model="modifiedUserData.birthday"
              label="Geburstag"
              starting-view="year"
            />
          </div>
          <div class="col-md-6">
            <BaseSelect
              id="shirtSize"
              v-model="modifiedUserData.tshirtSize"
              label="T-Shirt Größe"
              :show-label="true"
              :options="listOfTshirtSizes"
            />
          </div>
        </div>

        <div class="mt-3"></div>
      </div>
    </div>
    <h5>Benachrichtigungen</h5>
    <div class="form-check">
      <input
        id="notifyForComment"
        v-model="modifiedUserData.emailInformIfComment"
        class="form-check-input"
        type="checkbox"
        value
      />
      <label class="form-check-label" for="flexCheckDefault">
        E-Mail bei neuem Kommentar
        <!-- TODO: Add popup description -->

        <!-- <i class="bi bi-info-circle"></i> -->
      </label>
    </div>
    <div class="form-check">
      <input
        id="optInNewsletter"
        v-model="modifiedUserData.emailNewsletter"
        class="form-check-input"
        type="checkbox"
        value
      />
      <label class="form-check-label" for="flexCheckDefault">
        Newsletter abonnieren
        <!-- TODO: Add popup description -->
        <!-- <i class="bi bi-info-circle"></i> -->
      </label>
    </div>

    <br />
    <button
      class="btn btn-primary"
      :disabled="!profileDataHasChanged"
      @click="onSave"
    >
      Speichern
      <BaseSpinner v-if="showSpinner" />
      <i v-if="showSuccessInidcator" class="bi bi-check-circle"></i>
    </button>
    <p class="mt-3">* Wechsel nur außerhalb der Saison erlaubt</p>
    <!-- Error Message -->
    <BaseError :error-message="errorMessage" class="mt-3" />
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import useUserProfile from "@/composables/useUserProfile";
import BaseSpinner from "./BaseSpinner.vue";
import useSwal from "../composables/useSwal";
import { retrieveDateOnly } from "../helper/utils";
import useUser from "../composables/useUser";

const { showSuccessToast } = useSwal();
const { modifiedUserData, updateProfile, profileDataHasChanged } =
  useUserProfile();
const { getUserId } = useUser();

// Fetched data
const listOfCountries = ref(null);
const listOfStates = ref(null);
const listOfGenders = ref(null);
const listOfTshirtSizes = ref([]);
const listOfClubs = ref([]);
const isClubChangeable = ref(false);

// Page state
const showSpinner = ref(false);
const showSuccessInidcator = ref(false);
const errorMessage = ref(null);

// Clubs needs to be global to allow later access to object ids
const dataClubs = ref([]);

try {
  // Get constants
  const [resUserConstants, resClubs, resSeason] = await Promise.all([
    ApiService.getUserProfileConstants(),
    ApiService.getClubNames(),
    ApiService.getCurrentSeason(),
  ]);

  if (resUserConstants.status != 200) throw resUserConstants.statusText;
  if (resUserConstants.status != 200) throw resClubs.statusText;
  if (resUserConstants.status != 200) throw resSeason.statusText;
  const dataUserConstants = resUserConstants.data;
  dataClubs.value = resClubs.data;
  const dataSeason = resSeason.data;

  // Countries
  listOfCountries.value = Object.values(dataUserConstants.countries);
  // States
  listOfStates.value = Object.values(dataUserConstants.states);
  // Genders
  listOfGenders.value = Object.values(dataUserConstants.genders);
  // T-Shirt sizes
  listOfTshirtSizes.value = dataUserConstants.tShirtSizes;
  // Clubs
  listOfClubs.value = dataClubs.value.map((c) => c.name);
  // Is club changeable
  isClubChangeable.value =
    calculateOffseason(dataSeason) || (await hasNoFlightInSeason(dataSeason));

  errorMessage.value = "";
} catch (error) {
  console.log(error);
  errorMessage.value =
    "Beim laden der Daten ist ein Fehler aufgetreten. Bitte lade die Seite erneut.";
}

const stateListIsEnabled = computed(
  () => modifiedUserData.value.address.country === "Deutschland"
);

const onSave = async () => {
  try {
    showSpinner.value = true;

    modifiedUserData.value.clubId = findClubIdByName();

    await updateProfile();
    showSuccessToast("Änderungen gespeichert");
  } catch (error) {
    console.error(error);
    errorMessage.value = "Hoppla, da ist leider was schief gelaufen…";
  } finally {
    showSpinner.value = false;
  }
};

function calculateOffseason(dataSeason) {
  const today = new Date();
  const startDate = new Date(dataSeason.startDate);
  const endDate = new Date(dataSeason.endDate);
  return today < startDate || today > endDate;
}

function findClubIdByName() {
  return modifiedUserData.value.club.name
    ? dataClubs.value.find((e) => e.name == modifiedUserData.value.club.name).id
    : undefined;
}

async function hasNoFlightInSeason(dataSeason) {
  try {
    const flights = (
      await ApiService.getFlights({
        userId: getUserId.value,
        startDate: retrieveDateOnly(dataSeason.startDate),
        endDate: retrieveDateOnly(dataSeason.endDate),
        limit: 1,
      })
    ).data;
    return flights.count == 0;
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped></style>
