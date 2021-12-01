<template>
  <div v-if="editMode" class="p-3">
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
        <BaseInput
          id="club"
          v-model="modifiedUserData.club.name"
          label="Verein"
          :is-disabled="true"
        />

        <BaseInput id="email" v-model="modifiedUserData.email" label="E-Mail" />
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
          <div class="col-md-6">
            <BaseDatePicker
              id="birthday"
              v-model="modifiedUserData.birthday"
              label="Geburstag"
              starting-view="year"
              :initial-date="modifiedUserData.birthday"
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

        <i class="bi bi-info-circle"></i>
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
        <i class="bi bi-info-circle"></i>
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
    <!-- Error Message -->
    <p v-if="errorMessage" class="text-danger mt-3">
      {{ errorMessage }}
    </p>

    <!-- Edit -->
    <!-- <div v-if="!edit">
              <router-link
                :to="{ name: 'ProfileEdit' }"
                class="btn btn-primary"
              >
                Edit
              </router-link>
            </div>
            <div v-if="edit">
              <div>Edit: {{ modifiedUserData.value.firstName }}</div>

              <button class="btn btn-primary" @click="save">Speichern</button>
              <button class="btn btn-outline-danger" @click="cancel">
                Abbrechen
              </button>
            </div>-->
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import useUserProfile from "@/composables/useUserProfile";
import BaseSpinner from "./BaseSpinner.vue";

const { modifiedUserData, updateProfile, profileDataHasChanged } =
  useUserProfile();

// Fetched data
const listOfCountries = ref(null);
const listOfStates = ref(null);
const listOfGenders = ref(null);
const listOfTshirtSizes = ref([]);

// Page state
const showSpinner = ref(false);
const editMode = ref(true);
const showSuccessInidcator = ref(false);
const errorMessage = ref(null);

try {
  // Get constants
  let res = await ApiService.getUserProfileConstants();
  if (res.status != 200) throw res.statusText;
  // Countries

  listOfCountries.value = Object.keys(res.data.countries).map(function (i) {
    return res.data.countries[i];
  });
  // States
  listOfStates.value = Object.keys(res.data.states).map(function (i) {
    return res.data.states[i];
  });
  // Genders
  listOfGenders.value = Object.keys(res.data.genders).map(function (i) {
    return res.data.genders[i];
  });
  // T-Shirt sizes
  listOfTshirtSizes.value = res.data.tShirtSizes;
} catch (error) {
  // TODO: Handle error
  console.log(error);
}

const stateListIsEnabled = computed(
  () => modifiedUserData.value.address.country === "Deutschland"
);

const inidcateSuccess = () => {
  showSpinner.value = false;
  showSuccessInidcator.value = true;
  errorMessage.value = null;
  setTimeout(() => (showSuccessInidcator.value = false), 2000);
};

const onSave = async () => {
  try {
    showSpinner.value = true;
    await updateProfile();
    inidcateSuccess();
  } catch (error) {
    showSpinner.value = false;
    console.error(error);

    if (error.response?.data.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige E-Mail Adresse");

    errorMessage.value = "Hoppla, da ist leider was schief gelaufen…";
  }
};
</script>

<style scoped></style>
