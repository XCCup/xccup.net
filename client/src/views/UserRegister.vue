<template>
  <!-- Form -->
  <slot-dialog v-if="!signupSuccessfull" :prevent-overflow="true">
    <div>
      <h3 class="mb-4">Registrieren</h3>
      <form>
        <!-- Name -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <BaseInput
              id="firstName"
              v-model="userData.firstName"
              label="Vorname"
            />
          </div>
          <div class="col-md-6 mb-3">
            <BaseInput
              id="lastName"
              v-model="userData.lastName"
              label="Nachname"
            />
          </div>
        </div>
        <!-- E-Mail -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <BaseInput
              id="email"
              v-model="userData.email"
              label="E-Mail"
              :is-email="true"
            />
          </div>
        </div>

        <!-- Info collapse -->
        <div class="mb-3">
          <a
            data-bs-toggle="collapse"
            href="#collapseInfo"
            role="button"
            aria-expanded="false"
            aria-controls="collapseExample"
          >
            <i class="bi bi-info-circle"> Warum so viele weitere Angaben?</i>
          </a>
          <div id="collapseInfo" class="collapse">
            <div class="card card-body mt-3">
              Im XCCup gibt es verschiedene Wertungen die auf diesen
              Informationen basieren. Zum Beispiel die Seniorenwertung oder die
              Landesmeisterschaft Rheinland-Pfalz.
            </div>
          </div>
        </div>
        <!-- Gender / Birthday -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <BaseSelect
              id="gender"
              v-model="userData.gender"
              label="Geschlecht"
              :show-label="true"
              :options="listOfGenders"
            />
          </div>
          <div class="col-md-6 mb-3">
            <BaseDatePicker
              id="birthday"
              v-model="userData.birthday"
              label="Geburstag"
              starting-view="year"
              :upper-limit="upperLimitBirthday"
            />
          </div>
        </div>
        <!-- Country / Club -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <BaseSelect
              id="country"
              v-model="userData.address.country"
              label="Land"
              :show-label="true"
              :options="listOfCountries"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label>Verein</label>
            <select id="club" v-model="userData.clubId" class="form-select">
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
        <!-- State / Shirt -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <BaseSelect
              id="state"
              v-model="userData.address.state"
              label="Bundesland"
              :show-label="true"
              :options="listOfStates"
              :disabled="!stateListIsEnabled"
            />
          </div>
          <div class="col-md-6 mb-3">
            <BaseSelect
              id="shirtSize"
              v-model="userData.tshirtSize"
              label="T-Shirt Größe"
              :show-label="true"
              :options="tshirtSizes"
            />
          </div>
          <div class="col-md-6 mb-3"></div>
        </div>
        <!-- Password -->
        <div class="row">
          <p>
            Das Passwort muss aus mindestens 8 Zeichen bestehen und mindestens
            eine Zahl, Sonderzeichen und Großbuchstaben enthalten.
          </p>
          <div class="col-md-6 mb-3">
            <BaseInput
              id="password"
              v-model="userData.password"
              label="Passwort"
              :is-password="true"
            />
          </div>
          <div class="col-md-6 mb-3">
            <BaseInput
              id="passwordConfirm"
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
            id="acceptRulesCheckbox"
            v-model="rulesAccepted"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="acceptRulesCheckbox">
            Ich erkenne ich die
            <!-- TODO: Add link to Rules -->
            <router-link :to="{ name: 'Home' }">Ausschreibung </router-link>
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
            class="btn btn-primary btn"
            type="submit"
            :disabled="!registerButtonIsEnabled"
            @click.prevent="onSubmit"
          >
            Registrieren
            <div
              v-if="showSpinner"
              class="spinner-border spinner-border-sm"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          </button>
          <!-- Error message -->
          <p v-if="errorMessage" id="errorMessageText" class="text-danger mt-4">
            {{ errorMessage }}
          </p>
        </div>
      </form>
    </div>
  </slot-dialog>

  <!-- Confirmation -->
  <slot-dialog v-if="signupSuccessfull">
    <div v-if="signupSuccessfull" id="registerConfirmation">
      <div id="registerConfirmationHeader" class="text-center mb-3">
        <h1><i class="bi bi-check-circle text-success"></i></h1>
      </div>
      <p>
        Um deinen Account zu aktivieren öffne bitte den Link den wir dir gerade
        per Email geschickt haben.
      </p>
      <router-link :to="{ name: 'Home' }"> Zurück zur Startseite </router-link>
    </div>
  </slot-dialog>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import ApiService from "@/services/ApiService";
import { isStrongPassword, setWindowName } from "../helper/utils";
import useUserSignup from "@/composables/useUserSignup";

const { userData } = useUserSignup();

setWindowName("Registrieren");
const signupSuccessfull = ref(false);

// User input
const rulesAccepted = ref(false);
const errorMessage = ref(null);

// TODO: Form input validation with vue

// Set upper boundary of date picker
const limitDate = new Date();
limitDate.setYear(limitDate.getFullYear() - 20);
const upperLimitBirthday = ref(limitDate);

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
    isStrongPassword(userData.password) &&
    userData.firstName.length > 0 &&
    userData.lastName.length > 0 &&
    userData.birthday &&
    // Why does this happen anyway?
    userData.birthday != "NaN-NaN-NaN" &&
    userData.gender &&
    userData.clubId &&
    userData.address.country &&
    userData.tshirtSize
  );
});

// Queries
const listOfClubs = ref([]);
const listOfCountries = ref([]);
const listOfStates = ref([]);
const listOfGenders = ref([]);
const tshirtSizes = ref([]);

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
  tshirtSizes.value = res.data.tShirtSizes;

  // Get clubs
  res = await ApiService.getClubs();
  if (res.status != 200) throw res.statusText;
  listOfClubs.value = res.data;
} catch (error) {
  // TODO: Handle error
  console.log(error);
}

// Delete users state if country is not germany
watchEffect(() => {
  if (userData.address.country != "Deutschland") {
    userData.address.state = "";
  }
});

const stateListIsEnabled = computed(
  () => userData.address.country === "Deutschland"
);

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

    // TODO: Where do this error messages come from? Is this safe?
    // KW: Backend
    // email must be unique: ErrorHandler.js -> handleSequelizeUniqueError
    // email, password: Validaton.js middleware in endpoint
    // I would say it's safe

    // E-Mail errors
    if (error.response?.data === "email must be unique")
      return (errorMessage.value = "Diese E-Mail existiert bereits");
    if (error.response?.data.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige E-Mail Adresse");

    // Password errors
    if (error.response?.data.errors[0].param === "password")
      return (errorMessage.value = "Das Password ist nicht stark genug");

    console.log(error.response);
  }
};
</script>

<style lang="scss" scoped></style>
