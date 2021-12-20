<template>
  <div class="row my-3">
    <p>
      Das Passwort muss aus mindestens 8 Zeichen bestehen und mindestens eine
      Zahl, Sonderzeichen und Großbuchstaben enthalten.
    </p>
    <div class="col-md-6 mb-3">
      <!-- TODO: BaseInput should only be red if it was focused. 
      Otherwise it always "screams" to the user. And also after a 
      successfull change of password there is a lot of red that normally indicates error.
      But there is no error… This is bad UX
       -->
      <BaseInput
        id="password"
        v-model="password"
        label="Passwort"
        :is-password="true"
      />
    </div>
    <div class="col-md-6 mb-3">
      <BaseInput
        id="passwordConfirm"
        v-model="passwordConfirmation"
        label="Passwort wiederholen"
        :is-password="true"
        :external-validation-result="!passwordMatches"
      />
    </div>
    <div class="col-md-6 mb-3">
      <button
        class="btn btn-primary"
        :disabled="!saveButtonIsEnabled"
        @click="onSave"
      >
        Speichern
        <BaseSpinner v-if="showSpinner" />
        <i v-if="showSuccessInidcator" class="bi bi-check-circle"></i>
      </button>
      <BaseError :error-message="errorMessage" />
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import BaseError from "./BaseError.vue";
import { isStrongPassword } from "../helper/utils";

const password = ref("");
const passwordConfirmation = ref("");

// Page state
const showSpinner = ref(false);
const showSuccessInidcator = ref(false);
const errorMessage = ref(null);

const inidcateSuccess = () => {
  showSpinner.value = false;
  showSuccessInidcator.value = true;
  errorMessage.value = null;
  setTimeout(() => (showSuccessInidcator.value = false), 3000);
};

const onSave = async () => {
  try {
    showSpinner.value = true;
    await ApiService.changePassword({ password: password.value });
    inidcateSuccess();
    password.value = "";
    passwordConfirmation.value = "";
  } catch (error) {
    showSpinner.value = false;
    console.error(error);
    errorMessage.value = "Hoppla, da ist leider was schief gelaufen…";
  }
};

// Validation
const passwordMatches = computed(() => {
  return password.value === passwordConfirmation.value;
});

const saveButtonIsEnabled = computed(
  () =>
    password.value === passwordConfirmation.value &&
    isStrongPassword(password.value)
);
</script>

<style scoped></style>
