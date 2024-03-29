<template>
  <!-- Form -->
  <slot-dialog>
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
          <InfoCollapsable
            id="backgroundInformation"
            label="Warum so viele weitere Angaben?"
            info-message="Im XCCup gibt es verschiedene Wertungen die auf diesen
              Informationen basieren. Zum Beispiel die Seniorenwertung oder die
              Landesmeisterschaft Rheinland-Pfalz."
          />
        </div>
        <!-- Gender / Birthday -->
        <div class="row">
          <div class="col-md-6">
            <BaseSelect
              id="gender"
              v-model="userData.gender"
              label="Geschlecht"
              :show-label="true"
              :options="listOfGenders"
            />
          </div>
          <div class="col-md-6">
            <!-- TODO: Replace with three separate selects -->
            <BaseDatePicker
              id="birthday"
              v-model="userData.birthday"
              label="Geburtstag"
              starting-view="year"
              :upper-limit="initialDate"
            />
          </div>
        </div>
        <!-- Country / Club -->
        <div class="row">
          <div class="col-md-6">
            <BaseSelect
              id="country"
              v-model="userData.address.country"
              label="Land"
              :show-label="true"
              :options="listOfCountries"
            />
          </div>
          <div class="col-md-6">
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
          <div class="col-md-6">
            <BaseSelect
              id="state"
              v-model="userData.address.state"
              label="Bundesland"
              :show-label="true"
              :options="listOfStates"
              :disabled="!stateListIsEnabled"
            />
          </div>
          <div class="col-md-6">
            <BaseSelect
              id="shirtSize"
              v-model="userData.tshirtSize"
              label="T-Shirt Größe"
              :show-label="true"
              :options="tshirtSizes"
            />
          </div>
          <div class="col-md-6"></div>
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
            id="acceptRulesCheckbox"
            v-model="rulesAccepted"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="acceptRulesCheckbox">
            Ich erkenne ich die
            <a href="#" @click.prevent="compRulesModal.show()">Ausschreibung</a>
            und

            <a href="#" @click.prevent="privacyPolicyModal.show()"
              >Datenschutzbestimmungen</a
            >
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
          <BaseError
            id="errorMessageText"
            :error-message="errorMessage"
            class="mt-4"
          />
        </div>
      </form>
    </div>
    <BaseSlotModal modal-id="privacy-policy-modal" :scrollable="true">
      <PrivacyPolicy />
    </BaseSlotModal>
    <BaseSlotModal modal-id="comp-rules-modal" :scrollable="true">
      <CompRules />
    </BaseSlotModal>
  </slot-dialog>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from "vue";
import ApiService from "@/services/ApiService";
import { isStrongPassword, setWindowName } from "../helper/utils";
import useUserSignup from "@/composables/useUserSignup";
import { Modal } from "bootstrap";
import BaseSlotModal from "../components/BaseSlotModal.vue";
import PrivacyPolicy from "../components/PrivacyPolicy.vue";
import { useRouter } from "vue-router";
import useSwal from "../composables/useSwal";

const { showSuccessAlert } = useSwal();
const router = useRouter();
const { userData, initialDate } = useUserSignup();

setWindowName("Registrieren");

// User input
const rulesAccepted = ref(false);
const errorMessage = ref(null);

// TODO: Form input validation with vue

// Helpers
const showSpinner = ref(false);

// Modal
const privacyPolicyModal = ref(null);
const compRulesModal = ref(null);

const indicateSuccess = async () => {
  await showSuccessAlert(
    "Um deinen Account zu aktivieren öffne bitte den Link den wir dir gerade per Email geschickt haben."
  );
  router.push({ name: "Home" });
};

onMounted(async () => {
  privacyPolicyModal.value = new Modal(
    document.getElementById("privacy-policy-modal")
  );
  compRulesModal.value = new Modal(document.getElementById("comp-rules-modal"));
});

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
  router.push({
    name: "NetworkError",
  });
  console.log(error);
}

// Delete users state if country is not Germany
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
    await ApiService.register(userData);
    errorMessage.value = null;
    showSpinner.value = false;
    indicateSuccess();
  } catch (error) {
    showSpinner.value = false;

    // E-Mail errors
    if (error.response?.data.conflict === "emailExists")
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
