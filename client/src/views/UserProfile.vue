<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div v-if="modifiedUserData">
      <div class="row">
        <!-- Left -->
        <div class="col-md-3">
          <div class="d-flex flex-column align-items-center text-center p-3">
            <img
              class="rounded-circle"
              width="150px"
              src="https://avatars.dicebear.com/api/big-ears/your-custom-seed.svg?b=%23d9eb37"
            />
            <span class="font-weight-bold">Foo</span>
            <span class="text-secondary">Bar</span>
          </div>
        </div>

        <!-- Center -->
        <div class="col-md-9 col-lg-8">
          <nav>
            <div id="nav-tab" class="nav nav-tabs" role="tablist">
              <button
                id="nav-profile-tab"
                class="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#nav-profile"
                type="button"
                role="tab"
                aria-controls="nav-profile"
                aria-selected="true"
              >
                Profil
              </button>
              <button
                id="nav-hangar-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#nav-hangar"
                type="button"
                role="tab"
                aria-controls="nav-hangar"
                aria-selected="false"
              >
                Hangar
              </button>
              <button
                id="nav-my-flights-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#nav-my-flights"
                type="button"
                role="tab"
                aria-controls="nav-my-flights"
                aria-selected="false"
              >
                Meine Flüge
              </button>
            </div>
          </nav>
          <div id="nav-tabContent" class="tab-content">
            <div
              id="nav-profile"
              class="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="nav-profile-tab"
            >
              <div v-if="editMode" class="p-3">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
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

                    <BaseInput
                      id="email"
                      v-model="modifiedUserData.email"
                      label="E-Mail"
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
                    <div v-if="false" class="row mb-4">
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
                  <div
                    v-if="showSpinner"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span class="visually-hidden">Loading...</span>
                  </div>
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
              <div>Edit: {{ modifiedUserData.firstName }}</div>

              <button class="btn btn-primary" @click="save">Speichern</button>
              <button class="btn btn-outline-danger" @click="cancel">
                Abbrechen
              </button>
            </div>-->
              </div>
            </div>
            <div
              id="nav-hangar"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="nav-hangar-tab"
            >
              <div id="glider-select" class="col-md-12">
                <GliderList
                  :gliders="userData.value.gliders"
                  :default-glider="userData.value.defaultGlider"
                  @gliders-changed="onGlidersChanged"
                />
              </div>
            </div>
            <div
              id="nav-my-flights"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="nav-my-flights-tab"
            >
              ...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed, onMounted, watchEffect } from "vue";
import { setWindowName } from "../helper/utils";
import useUserProfile from "@/composables/useUserProfile";

setWindowName("Profil");
const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  scrollToGliderSelect: {
    type: Boolean,
    default: false,
  },
});

// TODO: Warn user if there are unsaved changes

const {
  modifiedUserData,
  fetchProfile,
  updateProfile,
  userData,
  profileDataHasChanged,
} = useUserProfile();

// Data
// const unmodifiedUserProfile = ref(null);

const listOfCountries = ref(null);
const listOfStates = ref(null);
const listOfGenders = ref(null);
const listOfTshirtSizes = ref([]);

// Page State
const showSpinner = ref(false);
const editMode = ref(true);
const showSuccessInidcator = ref(false);
const errorMessage = ref(null);

try {
  // Get user details
  fetchProfile();

  // Get countries
  let res = await ApiService.getCountries();
  if (res.status != 200) throw res.statusText;
  listOfCountries.value = Object.keys(res.data).map(function (i) {
    return res.data[i];
  });

  // Get states
  res = await ApiService.getStates();
  if (res.status != 200) throw res.statusText;
  listOfStates.value = Object.keys(res.data).map(function (i) {
    return res.data[i];
  });

  // Get genders
  res = await ApiService.getGenders();
  if (res.status != 200) throw res.statusText;
  listOfGenders.value = Object.keys(res.data).map(function (i) {
    return res.data[i];
  });

  // Get Shirt sizes
  res = await ApiService.getShirtSizes();
  if (res.status != 200) throw res.statusText;
  listOfTshirtSizes.value = res.data;
} catch (error) {
  console.log(error);
}

onMounted(() => {
  // Scroll to anchor if it exists after mounting
  const el = document.querySelector("#glider-select");
  if (el && props.scrollToGliderSelect) el.scrollIntoView();
});

// Delete users state if country is not germany
watchEffect(() => {
  if (modifiedUserData.address.country != "Deutschland") {
    modifiedUserData.address.state = "";
  }
});

const stateListIsEnabled = computed(
  () => modifiedUserData.address.country === "Deutschland"
);

const inidcateSuccess = () => {
  showSpinner.value = false;
  showSuccessInidcator.value = true;
  errorMessage.value = null;
  setTimeout(() => (showSuccessInidcator.value = false), 2000);
};

const onGlidersChanged = async () => {
  try {
    fetchProfile();
  } catch (error) {
    console.log(error);
  }
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
