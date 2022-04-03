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
        v-model="password"
        label="Passwort"
        :is-password="true"
        data-cy="password-input"
      />
    </div>
    <div class="col-md-6 mb-3">
      <BaseInput
        v-model="passwordConfirmation"
        label="Passwort wiederholen"
        :is-password="true"
        :external-validation-result="!passwordMatches"
        data-cy="password-confirm-input"
      />
    </div>
    <div class="col-md-6">
      <button
        class="btn btn-primary"
        :disabled="!saveButtonIsEnabled"
        data-cy="password-change-btn"
        @click="onSave"
      >
        Passwort ändern
        <BaseSpinner v-if="showSpinner" />
      </button>
      <BaseError :error-message="errorMessage" class="my-2" />
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import BaseError from "./BaseError.vue";
import { isStrongPassword } from "../helper/utils";
import useSwal from "../composables/useSwal";
import { GENERIC_ERROR } from "@/common/Constants";

const { showSuccessToast } = useSwal();
const password = ref("");
const passwordConfirmation = ref("");

// Page state
const showSpinner = ref(false);
const errorMessage = ref(null);

const onSave = async () => {
  try {
    showSpinner.value = true;
    await ApiService.changePassword({ password: password.value });
    showSuccessToast("Passwort geändert");
    password.value = "";
    passwordConfirmation.value = "";
  } catch (error) {
    console.error(error);
    errorMessage.value = GENERIC_ERROR;
  } finally {
    showSpinner.value = false;
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
