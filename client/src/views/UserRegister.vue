<template>
  <section class="bg-light">
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <!-- Form -->
        <div v-if="!signupSuccessfull" class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4 pb-2">Registrieren</h3>
              <form>
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseInput v-model="userData.firstName" label="Vorname" />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseInput v-model="userData.lastName" label="Nachname" />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="userData.email"
                      label="Email"
                      :is-email="true"
                    />
                  </div>

                  <div class="col-md-6 mb-4"></div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseSelect
                      v-model="userData.gender"
                      label="Geschlecht"
                      :show-label="true"
                      :options="listOfGenders"
                    />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseDatePicker
                      v-model="userData.birthday"
                      label="Geburstag"
                      starting-view="year"
                    />
                  </div>
                </div>

                <div class="row">
                  <!-- Country -->
                  <div class="col-md-6 mb-4">
                    <label>Land</label>
                    <select
                      v-model="userData.address.country"
                      class="form-select"
                    >
                      <option
                        v-for="option in listOfCountries"
                        :key="option.countryCode"
                        :value="option.countryCode"
                        :selected="option.key === userData.address.country"
                      >
                        {{ option.countryName }}
                      </option>
                    </select>
                  </div>
                  <!-- Club -->
                  <div class="col-md-6 mb-4">
                    <label>Verein</label>
                    <select v-model="userData.clubId" class="form-select">
                      <option
                        v-for="option in listOfClubs"
                        :key="option.id"
                        :value="option.id"
                        :selected="option.key === userData.clubId"
                      >
                        {{ option.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="row">
                  <!-- T-Shirt Size -->
                  <div class="col-md-6 mb-4">
                    <BaseSelect
                      v-model="userData.tshirtSize"
                      label="T-Shirt Größe"
                      :show-label="true"
                      :options="tshirtSizes"
                    />
                  </div>
                  <div class="col-md-6 mb-4"></div>
                </div>

                <!-- Password -->
                <div class="row">
                  <p>
                    Das Passwort muss aus mindestens 8 Zeichen bestehen und
                    mindestens eine Zahl, Sonderzeichen und Großbuchstaben
                    enthalten.
                  </p>
                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="userData.password"
                      label="Passwort"
                      :is-password="true"
                    />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="userData.passwordConfirm"
                      label="Passwort wiederholen"
                      :is-password="true"
                      :external-validation-result="!passwordMatches"
                    />
                  </div>
                </div>
                <!-- Checkboxes -->
                <div class="form-check mb-3">
                  <input
                    id="flexCheckNewsletter"
                    v-model="userData.emailNewsletter"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="flexCheckNewsletter">
                    Newsletter abonieren
                  </label>
                </div>

                <div class="form-check mb-3">
                  <input
                    id="flexCheckRules"
                    v-model="rulesAccepted"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="flexCheckRules">
                    Ich erkenne ich die
                    <!-- TODO: Add link to Rules -->
                    <router-link :to="{ name: 'Home' }"
                      >Ausschreibung
                    </router-link>
                    und
                    <router-link :to="{ name: 'Privacy' }"
                      >Datenschutzbestimmungen
                    </router-link>
                    an.
                  </label>
                </div>
                <!-- Submit button -->
                <div class="mt-4 pt-2">
                  <button
                    class="btn btn-primary btn-lg"
                    type="submit"
                    :disabled="!registerButtonIsEnabled"
                    @click.prevent="onSubmit"
                  >
                    Anmelden
                    <div
                      v-if="showSpinner"
                      class="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </button>
                  <!-- Error message -->
                  <p v-if="errorMessage" class="text-danger mt-4">
                    {{ errorMessage }}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!-- Confirmation -->
        <div v-if="signupSuccessfull" class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <div class="text-center">
                <h1><i class="bi bi-check-circle text-success"></i></h1>
              </div>
              <p>
                Um deinen Account zu aktivieren öffne bitte den Link den wir dir
                gerade per Email geschickt haben.
              </p>
              <router-link :to="{ name: 'Home' }">
                Zurück zur Startseite
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import { useRouter } from "vue-router";
import useUserData from "@/composables/useUserSignup";

const { userData } = useUserData();
const router = useRouter();

setWindowName("Anmelden");
const signupSuccessfull = ref(false);

// User input
const rulesAccepted = ref(false);
const errorMessage = ref(null);

// Helpers
const showSpinner = ref(false);

// Validation
const passwordMatches = computed(() => {
  return userData.passwordConfirm === userData.password;
});

const registerButtonIsEnabled = computed(() => {
  return (
    rulesAccepted.value &&
    passwordMatches.value &&
    userData.firstName.length > 0 &&
    userData.lastName.length > 0 &&
    userData.birthday &&
    userData.gender &&
    userData.clubId &&
    userData.address.country &&
    userData.tshirtSize
  );
});

// Queries
const listOfClubs = ref([]);
const listOfCountries = ref([]);
const listOfGenders = ref([]);
const tshirtSizes = ref([]);

try {
  // Get clubs
  let res = await ApiService.getClubs();
  if (res.status != 200) throw res.statusText;
  listOfClubs.value = res.data;

  // Get countries
  res = await ApiService.getCountries();
  if (res.status != 200) throw res.statusText;
  listOfCountries.value = Object.keys(res.data).map(function (i) {
    return { countryCode: i, countryName: res.data[i] };
  });

  // Get Shirt sizes
  res = await ApiService.getShirtSizes();
  if (res.status != 200) throw res.statusText;
  tshirtSizes.value = res.data;

  // Get genders
  res = await ApiService.getGenders();
  if (res.status != 200) throw res.statusText;
  listOfGenders.value = Object.keys(res.data).map(function (i) {
    return res.data[i];
  });
} catch (error) {
  console.log(error);
}

// Submit
const onSubmit = async () => {
  showSpinner.value = true;
  try {
    const res = await ApiService.register(userData);
    if (res.status != 200) throw res.statusText;
    errorMessage.value = null;
    showSpinner.value = false;
    signupSuccessfull.value = true;
  } catch (error) {
    showSpinner.value = false;

    // Todo: Where do this error messages come from? Is this safe?

    // Email errors
    if (error.response?.data === "email must be unique")
      return (errorMessage.value = "Diese Email existiert bereits");
    if (error.response?.data.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige Email Adresse");

    // Password errors
    if (error.response?.data.errors[0].param === "password")
      return (errorMessage.value = "Das Password ist nicht stark genug");

    console.log(error.response);
  }
};
</script>

<style scoped></style>
